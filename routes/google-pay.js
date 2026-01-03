import express from 'express'
import {faker} from '@faker-js/faker'

const googlePayRouter = express.Router()

googlePayRouter.post('/google-pay-payment', async (req, res) => {

  if (!req.body.token) {
    return res.status(400).json({ error: 'Missing payment token' });
  }

  const url = 'https://api.sandbox.checkout.com/payments'
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.CKO_NAS_SECRET_KEY
    },
    body: JSON.stringify({
      'source': {
        'type': 'token',
        'token': req.body.token,
      },
      'amount': 300,
      'currency': 'USD',
      'reference': `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    })
  }

  try{
    const rawResponse = await fetch(url, request);
    const response = await rawResponse.json();
    console.log(`Received response from: ${url}`, response)
    res.status(rawResponse.status).json(response)
  } catch (error) {
      console.error(`Received error from: ${url}`, error);
      res.status(500).json({ 
        error: 'Received an error from /payments' 
      })
  }
})

export {googlePayRouter}