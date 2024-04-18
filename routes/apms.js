import dotenv from 'dotenv'
import express from 'express'
import {faker} from '@faker-js/faker'
import fetch from 'node-fetch'

const apmsRouter = express.Router();

dotenv.config();

apmsRouter.post('/create-apm-url', async (req, res) => {

  const apm = req.body.source.type
  req.body.reference = `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`
  req.body.success_url = process.env.SUCCESS_URL
  req.body.failure_url = process.env.FAILURE_URL
  req.body.capture = 'true'

  var url = ''

  if (apm === 'paypal')
    url = 'https://api.sandbox.checkout.com/payment-contexts'
  else
    url = 'https://api.sandbox.checkout.com/payments'

  if(apm === 'eps' || apm === 'giropay' || apm === 'trustly')
    req.body.processing_channel_id = process.env.CKO_EEA_PROCESSING_CHANNEL_ID
  else
    req.body.processing_channel_id = process.env.CKO_NAS_PROCESSING_CHANNEL_ID 

  const options = {
    method: 'POST', 
    body: JSON.stringify(req.body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  }

  console.log(`\nSubmitting request to: ${url}`)
  console.log(options)

  const response = await (await fetch(url, options)).json()

  console.log(`\nReceived response from: ${url} `)
  console.log(response)

  res.status(200).json(response)

})

apmsRouter.post('/run-apm-payment', async (req, res) => {

  // wait 60 seconds to observe webhook timing
  //console.log('waiting 30 seconds...')
  //await new Promise(resolve => setTimeout(resolve, 30000));

  const url = 'https://api.sandbox.checkout.com/payments'

  const options = {
    method: 'POST', 
    body: JSON.stringify({
      'payment_context_id': req.body.paypalPaymentContext,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  }

  console.log(`\nSubmitting request to: ${url}`)
  console.log(options)

  const response = await (await fetch(url, options)).json()
  
  console.log(`\nReceived response from: ${url} `)
  console.log(response)

  res.status(200).json(response)

})

export {apmsRouter}; 