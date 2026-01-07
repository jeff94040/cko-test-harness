import {Router} from 'express'
import {faker} from '@faker-js/faker'
import fetch from 'node-fetch'
import fs from 'fs'
import https from 'node:https'
import crypto from 'crypto'
import ApplePayJs from '@basis-theory/apple-pay-js';

const { ApplePaymentTokenContext } = ApplePayJs;

const applePayRouter = Router();

// Validate Session
applePayRouter.post('/apple-pay-validate-session', async (req, res) => {

  const checkoutDecryption = req.body.applePayMerchantId === process.env.APPLE_PAY_MERCHANT_ID ? true : false
  console.log('checkoutDecryption: ', checkoutDecryption)

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, 
    cert: fs.readFileSync(checkoutDecryption ? process.env.APPLE_PAY_CERTIFICATE : process.env.APPLE_PAY_MERCHANT_DECRYPTION_CERTIFICATE),
    key: fs.readFileSync(checkoutDecryption ? process.env.APPLE_PAY_KEY : process.env.APPLE_PAY_MERCHANT_DECRYPTION_KEY)
  })

  const validateRequest = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    agent: httpsAgent,
    body: JSON.stringify({
      merchantIdentifier: checkoutDecryption ? process.env.APPLE_PAY_MERCHANT_ID : process.env.APPLE_PAY_MERCHANT_DECRYPTION_MERCHANT_ID,
      domainName: process.env.APPLE_PAY_DOMAIN,
      displayName: process.env.APPLE_PAY_DISPLAY_NAME
    })
  }

  const rawValidateSessionResponse = await fetch(req.body.validationURL, validateRequest)

  if (!rawValidateSessionResponse.ok) {
    const errorMsg = await rawValidateSessionResponse.text();
    throw new Error(`Apple Session Validation Failed: ${errorMsg}`);
  }

  const validateSessionResponse = await rawValidateSessionResponse.json()

  console.log('validate session response: ', validateSessionResponse)

  res.status(200).json(validateSessionResponse)
})

// Request Payment
applePayRouter.post('/apple-pay-payment', async (req, res) => {

  const url = 'https://api.sandbox.checkout.com/payments'
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    },
    body: JSON.stringify({
      'source': {
        'type': 'token',
        token: req.body.token,
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
        'name': req.body.payment.billingContact.givenName + ' ' + req.body.payment.billingContact.familyName,
        'email': req.body.payment.shippingContact.emailAddress
      },
      'amount': 300,
      'currency': 'USD',
      'reference': `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    })
  }

  const rawPaymentResponse = await fetch(url, request)
  const paymentResponse = await rawPaymentResponse.json()  
  console.log('Received response from: ', url, paymentResponse)

  res.status(200).json(paymentResponse)
})

/*
async function merchantDecryptionPayment(req){
  console.log('got here')

  // --- CONFIGURATION ---
  const MERCHANT_ID = process.env.APPLE_PAY_DECRYPTION_MERCHANT_ID
  const PRIVATE_KEY_PATH = process.env.APPLE_PAY_DECRYPTION_TRANSACTION_KEY

  // Paste your FULL token object here
  // (I have filled in the structure based on your provided snippet)
  const TOKEN = {
    paymentData: {
      version: 'EC_v1',
      // REPLACE THIS with the full Base64 string from your actual payload
      data: req.body.payment.token.paymentData.data,
      signature: req.body.payment.token.paymentData.signature,
      header: {
          // REPLACE THIS with the actual ephemeralPublicKey from your payload
          ephemeralPublicKey: req.body.payment.token.paymentData.header.ephemeralPublicKey, 
          publicKeyHash: req.body.payment.token.paymentData.header.publicKeyHash,
          transactionId: req.body.payment.token.paymentData.header.transactionId
      }
    }
  };

  // BASIS THEORY CODE BEGIN
  // create the decryption context
  const context = new ApplePaymentTokenContext({
    // add as many merchant certificates you need
    merchants: [
      {
        // optional certificate identifier
        //identifier: process.env.APPLE_PAY_DECRYPTION_MERCHANT_ID,
        // the certificate and the private key are Buffers in PEM format
        certificatePem: fs.readFileSync(process.env.APPLE_PAY_DECRYPTION_TRANSACTION_CERTIFICATE),
        privateKeyPem: fs.readFileSync(process.env.APPLE_PAY_DECRYPTION_TRANSACTION_KEY),
      },
    ],
  });

  try {
    // decrypts Apple's PKPaymentToken paymentData
    console.log(context.decrypt(req.body.payment.token.paymentData));
  } catch (error) {
    console.error('could not decrypt the token with given merchant certificates: ', error)
    // couldn't decrypt the token with given merchant certificates
  }
  // BASIS THEORY CODE END

  //console.log('TOKEN: ', TOKEN)
  //console.log('MERCHANT_ID: ', MERCHANT_ID)
  //console.log('PRIVATE_KEY_PATH: ', PRIVATE_KEY_PATH)
  
    //const result = decryptApplePayToken(TOKEN, MERCHANT_ID, PRIVATE_KEY_PATH);

    //if (result) {
      //  console.log("SUCCESS! Decrypted Payment Data:");
      //  console.log(JSON.stringify(result, null, 2));
    //}
  
  return {}
}
*/

// Request Payout
applePayRouter.post('/apple-pay-payout', async (req, res) => {

  const url = 'https://api.sandbox.checkout.com/payments'

  const request = {
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
        'token': req.body.token,
        'account_holder': {
          'type': 'individual',
          'first_name': req.body.payment.billingContact.givenName,
          'last_name': req.body.payment.billingContact.familyName,
          'billing_address':{
            'address_line1': req.body.payment.billingContact.addressLines[0],
            'city': req.body.payment.billingContact.locality,
            'state': req.body.payment.billingContact.administrativeArea,
            'zip': req.body.payment.billingContact.postalCode,
            'country': req.body.payment.billingContact.countryCode
          }
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

  const rawPayoutResponse = await fetch(url, request)
  const payoutResponse = await rawPayoutResponse.json()
  console.log('Received response from: ', url, payoutResponse)

  res.status(200).json(payoutResponse)
})

export {applePayRouter}; 