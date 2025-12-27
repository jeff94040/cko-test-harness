import express from 'express'
import {faker} from '@faker-js/faker'

const googlePayRouter = express.Router()

googlePayRouter.get('/google-pay', (req, res) => {
  res.status(200)
})


googlePayRouter.post('/google-pay-payment', async (req, res) => {

  console.log('token', req.token)

  const runPaymentUrl = 'https://api.sandbox.checkout.com/payments'
  const runPaymentOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
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

  console.log(`\nSubmitting request to: ${runPaymentUrl}`, runPaymentOptions)
  const paymentResponse = await (await fetch(runPaymentUrl, runPaymentOptions)).json()
  console.log(`\nReceived response from: ${runPaymentUrl} `, paymentResponse)

  res.status(200).json(paymentResponse)
  
})

export {googlePayRouter}