import dotenv from 'dotenv'
import express from 'express'
import {faker} from '@faker-js/faker'
import fetch from 'node-fetch'

const apmsRouter = express.Router();

dotenv.config();

apmsRouter.post('/create-apm-url', async (req, res) => {

  req.body.reference = `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`
  req.body.success_url = process.env.SUCCESS_URL
  req.body.failure_url = process.env.FAILURE_URL
  req.body.capture = 'true'
  req.body.processing_channel_id = process.env.CKO_NAS_PROCESSING_CHANNEL_ID 

  const url = 'https://api.sandbox.checkout.com/payment-contexts'

  const request = {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.CKO_NAS_SECRET_KEY
    },
    body: JSON.stringify(req.body)
  }

  const rawResponse = await fetch(url, request)
  const response = await rawResponse.json()
  console.log('Received response from: ', url, response)

  res.status(200).json(response)

})

apmsRouter.post('/run-apm-payment', async (req, res) => {

  const url = 'https://api.sandbox.checkout.com/payments'
  const request = {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    },
    body: JSON.stringify({
      'payment_context_id': req.body.paypalPaymentContext,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    })
  }

  const rawResponse = await fetch(url, request)
  const response = await rawResponse.json()
  
  console.log('Received response from: ', url, response)

  res.status(200).json(response)

})

export {apmsRouter}; 