import dotenv from 'dotenv'
import express from 'express'
import fetch from 'node-fetch'

const paymentComponentsRouter = express.Router();

dotenv.config();

// create payment session
paymentComponentsRouter.post('/create-payment-session', async (req, res) => {

  const paymentSession = await (await fetch('https://api.sandbox.checkout.com/payment-sessions', {
    method: 'POST',
    body: JSON.stringify(req.body),
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