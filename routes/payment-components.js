import dotenv from 'dotenv'; 
import express from 'express';
import fetch from 'node-fetch';
import { generateReference } from '../util.js';

const paymentComponentsRouter = express.Router();

dotenv.config();

// create payment session
paymentComponentsRouter.post('/create-payment-session', async (req, res) => {

  const paymentSession = await (await fetch('https://api.sandbox.checkout.com/payment-sessions', {
    method: 'POST',
    body: JSON.stringify({
      amount: 1000,
      currency: 'USD',
      reference: `REF-${generateReference(6)}`,
      billing: {
        address: {
          country: 'US'
        }
      },
      customer: {
        name: 'John Smith',
        email: 'john.smith@xamples.com'
      },
      success_url: process.env.SUCCESS_URL,
      failure_url: process.env.FAILURE_URL,
      processing_channel_id: process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  })).json()
  console.log('response from /payment-sessions:')
  console.log((paymentSession));

  res.status(200).json(paymentSession);

});


export {paymentComponentsRouter}; 