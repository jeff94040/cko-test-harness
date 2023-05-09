import dotenv from 'dotenv'; 
import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import https from 'node:https';
import { generateReference } from '../util.js';

const applePayRouter = express.Router();

//import config props from .env file
dotenv.config();

// apple pay - return merchant id
applePayRouter.get('/apple-pay-merchant-id', (req, res) => {
  res.send(process.env.APPLE_PAY_MERCHANT_ID)
})

// apple pay - create custom agent and validate session
applePayRouter.post('/apple-pay-validate-session', async (req, res) => {

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    cert: fs.readFileSync(process.env.APPLE_PAY_CERTIFICATE),
    key: fs.readFileSync(process.env.APPLE_PAY_KEY)
  })

  const validateSessionResponse = await (await fetch(req.body.validationURL, {
    method: 'POST',
    body: JSON.stringify({
      merchantIdentifier: process.env.APPLE_PAY_MERCHANT_ID,
      domainName: process.env.APPLE_PAY_DOMAIN,
      displayName: process.env.APPLE_PAY_DISPLAY_NAME
    }),
    headers: {'Content-Type': 'application/json'},
    agent: httpsAgent
  })).json()
  console.log(`validate session response: ${JSON.stringify(validateSessionResponse)}`)

  res.status(200).json(validateSessionResponse)
})

// apple pay - request payment
applePayRouter.post('/apple-pay-payment', async (req, res) => {

  // apple pay - create cko token
  const createTokenResponse = await (await fetch('https://api.sandbox.checkout.com/tokens', {
    method: 'POST',
    body: JSON.stringify({
      'type': 'applepay',
      'token_data': req.body.token.paymentData
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_PUBLIC_KEY}`
    }
  })).json()
  console.log(`create token response: ${JSON.stringify(createTokenResponse)}`)

  // apple pay - submit payment
  const paymentResponse = await (await fetch('https://api.sandbox.checkout.com/payments', {
    method: 'POST',
    body: JSON.stringify({
      'source': {
        'type': 'token',
        'token': createTokenResponse.token
      },
      'amount': 300,
      'currency': 'USD',
      'reference': `REF-${generateReference(6)}`,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  })).json()
  console.log(`payment response: ${JSON.stringify(paymentResponse)}`)

  res.status(200).json(paymentResponse)
})

export {applePayRouter}; 