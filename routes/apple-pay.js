import dotenv from 'dotenv'
import express from 'express'
import {faker} from '@faker-js/faker'
import fetch from 'node-fetch'
import fs from 'fs'
import https from 'node:https'

const applePayRouter = express.Router();

//import config props from .env file
dotenv.config();

// Apple Pay - Return Apple Pay Merchant ID
applePayRouter.get('/apple-pay-merchant-id', (req, res) => {
  res.send(process.env.APPLE_PAY_MERCHANT_ID)
})

// Apple Pay - Request an Apple Pay Payment Session
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
      //domainName: 'michaeltaylor.io',
      displayName: process.env.APPLE_PAY_DISPLAY_NAME
    }),
    headers: {'Content-Type': 'application/json'},
    agent: httpsAgent
  })).json()
  console.log('validate session response:')
  console.log(validateSessionResponse)

  res.status(200).json(validateSessionResponse)
})

// apple pay - request payout
applePayRouter.post('/apple-pay-payout', async (req, res) => {

  const url = 'https://api.sandbox.checkout.com/payments'
  const paymentToken = await requestToken(req.body.payment.token.paymentData)

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    },    
    body: JSON.stringify({
      'source': {
        'type': 'currency_account',
        'id': `${process.env.CKO_NAS_CURRENCY_ACCOUNT_ID}`
      },
      'destination': {
        'type': 'token',
        'token': paymentToken,
        'account_holder': {
          'type': 'individual',
          'first_name': req.body.payment.shippingContact.givenName.split(' ')[0],
          'last_name': req.body.payment.shippingContact.givenName.split(' ')[1],
          'billing_address':{
            'address_line1': req.body.payment.billingContact.addressLines[0],
            'city': req.body.payment.billingContact.locality,
            'state': req.body.payment.billingContact.administrativeArea,
            'zip': req.body.payment.billingContact.postalCode,
            'country': req.body.payment.billingContact.countryCode
          },
        }
      },
      'instruction': {
        'funds_transfer_type': 'FD'
      },
      'amount': 100,
      'currency': 'USD',
      'reference': `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    })
  }

  console.log(`\nSubmitting request to: ${url}`)
  console.log(options)

  const response = await (await fetch(url, options)).json()

  console.log(`\nReceived response from: ${url} `)
  console.log(response)

  res.status(200).json(response)
})

// apple pay - request payment
applePayRouter.post('/apple-pay-payment', async (req, res) => {

  const url = 'https://api.sandbox.checkout.com/payments'
  const paymentToken = await requestToken(req.body.payment.token.paymentData)
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    },
    body: JSON.stringify({
      'source': {
        'type': 'token',
        'token': paymentToken,
        'billing_address':{
          'address_line1': req.body.payment.billingContact.addressLines[0],
          'city': req.body.payment.billingContact.locality,
          'state': req.body.payment.billingContact.administrativeArea,
          'zip': req.body.payment.billingContact.postalCode,
          'country': req.body.payment.billingContact.countryCode
        },
        'phone': {
          'country_code': '1',
          'number': req.body.payment.shippingContact.phoneNumber
        }
      },
      'customer': {
        'name': req.body.payment.shippingContact.givenName,
        'email': req.body.payment.shippingContact.emailAddress
      },
      'amount': 300,
      'currency': 'USD',
      'reference': `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    })
  }

  console.log(`\nSubmitting request to: ${url}`)
  console.log(options)

  const response = await (await fetch(url, options)).json()

  console.log(`\nReceived response from: ${url} `)
  console.log(response)

  res.status(200).json(response)
})

// Apple Pay - Request tok_xxx given encrypted payment data
async function requestToken(paymentData){

  const url = 'https://api.sandbox.checkout.com/tokens'

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_PUBLIC_KEY}`
    },
    body: JSON.stringify({
      'type': 'applepay',
      'token_data': paymentData
    })
  }

  console.log(`\nSubmitting request to: ${url}`)
  console.log(options)

  // apple pay - create cko token
  const response = await (await fetch(url, options)).json()
  console.log(`\nReceived response from: ${url} `)
  console.log(response)

  return response.token
}

export {applePayRouter}; 