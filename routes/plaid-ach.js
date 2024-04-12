import dotenv from 'dotenv'
import express from 'express'
import {faker} from '@faker-js/faker'
import fetch from 'node-fetch' 

//import config props from .env file
dotenv.config();

const plaidAchRouter = express.Router();

// plaid - create link token
plaidAchRouter.get('/plaid/link-token', async (req, res) => {

  const tokenCreateResponse = await (await fetch('https://sandbox.plaid.com/link/token/create', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SANDBOX_KEY,
      user: {
        client_user_id: "client_user_id_1"
      },
      client_name: "Jeff's CKO Test Harness",
      products: ["auth"],
      country_codes: ["US"],
      language: "en"
    }),
    headers: {'Content-Type': 'application/json'}
  })).json()
  console.log(`response from /link/token/create: ${JSON.stringify(tokenCreateResponse)}`);
  res.status(200).json(tokenCreateResponse);

});

// plaid - token exchange and payment
plaidAchRouter.post('/plaid/access-token', async (req, res) => {

  const exchangeResponse = await (await fetch('https://sandbox.plaid.com/item/public_token/exchange', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SANDBOX_KEY,
      public_token: req.body.public_token}),
    headers: {'Content-Type': 'application/json'}
  })).json()
  console.log(`response from /item/public_token/exchange: ${JSON.stringify(exchangeResponse)}`);

  const processorTokenResponse = await (await fetch('https://sandbox.plaid.com/processor/token/create', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SANDBOX_KEY,
      access_token: exchangeResponse.access_token,
      account_id: req.body.account_id,
      processor: 'checkout'}),
    headers: {'Content-Type': 'application/json'}
  })).json()
  console.log(`response from /processor/token/create: ${JSON.stringify(processorTokenResponse)}`);

  const paymentResponse = await (await fetch('https://api.sandbox.checkout.com/payments', {
    method: 'POST',
    body: JSON.stringify({
      source: {
          'type': 'provider_token',
          'payment_method': 'ach',
          'token': processorTokenResponse.processor_token,
          'account_holder': {
              'type': 'Individual',
              'first_name': 'John',
              'last_name': 'Doe'
          }
      },
      amount: req.body.amount,
      currency: 'USD',
      reference: `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
      processing_channel_id: process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  })).json()
  console.log(`response from /payments: ${JSON.stringify(paymentResponse)}`);

  res.status(200).json(paymentResponse);
});

export {plaidAchRouter};