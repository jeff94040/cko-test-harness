import dotenv from 'dotenv'
import express from 'express'
import fetch from 'node-fetch'

const flowRouter = express.Router();

dotenv.config();

// create payment session
flowRouter.post('/create-payment-session', async (req, res) => {

  req.body.processing_channel_id = req.get('Processing-Channel-Id')
  console.log(req.get('Processing-Channel-Id'), req.get('Public-Key'), req.get('Authorization'))

  const paymentSession = await (await fetch('https://api.sandbox.checkout.com/payment-sessions', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.get('Authorization') === 'sk_sbox_***************************' ? process.env.CKO_NAS_SECRET_KEY : req.get('Authorization')
    }
  })).json()

  console.log('response from /payment-sessions:', paymentSession)
  res.status(200).json(paymentSession);

});

export {flowRouter}; 