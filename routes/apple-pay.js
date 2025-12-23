import dotenv from 'dotenv'
import express from 'express'
import {faker} from '@faker-js/faker'
import fetch from 'node-fetch'
import fs from 'fs'
import https from 'node:https'
import crypto from 'crypto'
import { clear } from 'node:console'

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

  decryptApplePayPayload(req.body.payment)

  // req represents the 'payment' object from onpaymentauthorized() callback from the Apple Pay JS SDK
  // see req.body.payment.billingContact and req.body.payment.shippingContact
  // see req.body.payment.token.paymentData.data for the encrypted blob
  // see req.body.payment.token.paymentMethod for card metadata {displayName: 'Visa 2918', network: 'Visa', type: 'credit'}

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

async function decryptApplePayPayload(payment){

  // data from private key
  const merchantPrivateKeyPem = fs.readFileSync(process.env.APPLE_PAY_KEY, 'utf8');
  console.log(`merchantPrivateKeyPem: ${merchantPrivateKeyPem}`)

  // data from Apple Pay payload
  const ephemeralPublicKeyB64 = payment.token.paymentData.header.ephemeralPublicKey;
  console.log(`ephemeralPublicKeyB64: ${ephemeralPublicKeyB64}`)
  const encryptedDataB64 = payment.token.paymentData.data;
  console.log(`encryptedDataB64: ${encryptedDataB64}`)

  var clearText = decryptApplePay(payment.token.paymentData, merchantPrivateKeyPem, process.env.APPLE_PAY_MERCHANT_ID)
  console.log(`clear text: ${clearText}`)

}

function decryptApplePay(applePayData, merchantPrivateKeyPem, merchantIdString) {
    const { data, header } = applePayData;
    const { ephemeralPublicKey, transactionId } = header;

    // 1. Load the Private Key
    const privKeyObj = crypto.createPrivateKey(merchantPrivateKeyPem);

    // 2. Load the Ephemeral Public Key from Apple
    const pubKeyBuf = Buffer.from(ephemeralPublicKey, 'base64');
    const pubKeyObj = crypto.createPublicKey({
        key: pubKeyBuf,
        format: 'der',
        type: 'spki'
    });

    // 3. Generate Shared Secret (ECDH)
    // This replaces the .export() and .setPrivateKey() logic
    const sharedSecret = crypto.diffieHellman({
        privateKey: privKeyObj,
        publicKey: pubKeyObj
    });

    // 4. Key Derivation Function (KDF)
    const algorithm = Buffer.from('\x0Did-aes256-GCM', 'ascii');
    const partyU = Buffer.from('Apple', 'ascii');
    // Hash of the Merchant ID string is required for Party V
    const partyV = crypto.createHash('sha256').update(merchantIdString).digest();
    
    const info = Buffer.concat([algorithm, partyU, partyV]);
    
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.from([0, 0, 0, 1])); // Counter
    hash.update(sharedSecret);
    hash.update(info);
    const symmetricKey = hash.digest();

    // 5. AES-256-GCM Decryption
    const encryptedBuf = Buffer.from(data, 'base64');
    const iv = Buffer.alloc(16, 0); // Apple Pay uses 16 null bytes
    const tag = encryptedBuf.slice(-16);
    const cipherText = encryptedBuf.slice(0, -16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(cipherText),
        decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
}

export {applePayRouter}; 