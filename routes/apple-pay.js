import dotenv from 'dotenv'
import express from 'express'
import {faker} from '@faker-js/faker'
import fetch from 'node-fetch'
import fs from 'fs'
import https from 'node:https'
import crypto from 'crypto'
import ApplePayJs from '@basis-theory/apple-pay-js';

// Destructure from the default export
const { ApplePaymentTokenContext } = ApplePayJs;

const applePayRouter = express.Router();

dotenv.config();

// Validate Session
applePayRouter.post('/apple-pay-validate-session', async (req, res) => {

  console.log('req.body.applePayMerchantId: ',req.body.applePayMerchantId)
  console.log('req.body: ', req.body)
  var checkoutDecryption = true // checkout decryption by default
  if (req.body.applePayMerchantId === process.env.APPLE_PAY_MERCHANT_DECRYPTION_MERCHANT_ID)
    checkoutDecryption = false // merchant decryption

  console.log('checkoutDecryption: ', checkoutDecryption)

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, 
    cert: fs.readFileSync(checkoutDecryption ? process.env.APPLE_PAY_CERTIFICATE : process.env.APPLE_PAY_MERCHANT_DECRYPTION_CERTIFICATE),
    key: fs.readFileSync(checkoutDecryption ? process.env.APPLE_PAY_KEY : process.env.APPLE_PAY_MERCHANT_DECRYPTION_KEY)
  })

  const validateSessionResponse = await (await fetch(req.body.validationURL, {
    method: 'POST',
    body: JSON.stringify({
      merchantIdentifier: checkoutDecryption ? process.env.APPLE_PAY_MERCHANT_ID : process.env.APPLE_PAY_MERCHANT_DECRYPTION_MERCHANT_ID,
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

// Request Payout
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

  console.log(`\nSubmitting request to: ${url}`, options)
  const response = await (await fetch(url, options)).json()
  console.log(`\nReceived response from: ${url} `, response)

  res.status(200).json(response)
})

// Request Payment
applePayRouter.post('/apple-pay-payment', async (req, res) => {

  console.log('req.body.applePayMerchantId: ',req.body.applePayMerchantId)

  switch(req.body.applePayMerchantId){
    case process.env.APPLE_PAY_MERCHANT_ID:
      res.status(200).json(await checkoutDecryptionPayment(req))
      break;
    case process.env.APPLE_PAY_DECRYPTION_MERCHANT_ID:
      res.status(200).json(await merchantDecryptionPayment(req))
      break;
    default:
      // do nothing
  }
})

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
  /*
    const result = decryptApplePayToken(TOKEN, MERCHANT_ID, PRIVATE_KEY_PATH);

    if (result) {
        console.log("SUCCESS! Decrypted Payment Data:");
        console.log(JSON.stringify(result, null, 2));
    }
  */
  return {}
}

async function checkoutDecryptionPayment(req){

  const createTokenUrl = 'https://api.sandbox.checkout.com/tokens'

  const createTokenOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_PUBLIC_KEY}`
    },
    body: JSON.stringify({
      'type': 'applepay',
      'token_data': req.body.payment.token.paymentData
    })
  }

  console.log(`\nSubmitting request to: ${createTokenUrl}`, createTokenOptions)
  const createTokenResponse = await (await fetch(createTokenUrl, createTokenOptions)).json()
  console.log(`\nReceived response from: ${createTokenUrl} `, createTokenResponse)

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
        'token': createTokenResponse.token,
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

  console.log(`\nSubmitting request to: ${runPaymentUrl}`, runPaymentOptions)
  const paymentResponse = await (await fetch(runPaymentUrl, runPaymentOptions)).json()
  console.log(`\nReceived response from: ${runPaymentUrl} `, paymentResponse)

  //res.status(200).json(paymentResponse)
  return paymentResponse
}
/*
function decryptApplePayToken(token, merchantId, privateKeyPath) {
    try {
        // 1. Load your Private Key
        const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf8');
        const myPrivateKey = crypto.createPrivateKey(privateKeyPem);

        // --- DEBUGGING START ---
        console.log("Key Type:", myPrivateKey.type); // Should be 'private'
        console.log("Algorithm:", myPrivateKey.asymmetricKeyType); // MUST be 'ec'

        // This will confirm if it is the correct curve (prime256v1)
        console.log("Key Details:", myPrivateKey.asymmetricKeyDetails); 
        // --- DEBUGGING END ---

        // 2. Extract Token Parts
        const { header, data } = token.paymentData;
        const ephemeralPublicKeyStr = header.ephemeralPublicKey;

        console.log('header: ', header)
        console.log('data: ', data)
        console.log('ephemeralPublicKeyStr: ', ephemeralPublicKeyStr)
        
        // 3. Reconstruct the Ephemeral Public Key
        // Apple sends it as Base64. We need a KeyObject for ECDH.
        const applePublicKeyBuffer = Buffer.from(ephemeralPublicKeyStr, 'base64');
        const applePublicKey = crypto.createPublicKey({
            key: applePublicKeyBuffer,
            format: 'der',
            type: 'spki'
        });

        // 4. Generate Shared Secret (ECDH)
        // We use our Private Key + Apple's Public Key
        const sharedSecret = crypto.diffieHellman({
            privateKey: myPrivateKey,
            publicKey: applePublicKey
        });

        // 5. Derive Symmetric Key (KDF)
        // We need to construct the "Info" buffer according to NIST SP 800-56A
        
        // A. Algorithm ID: length (1 byte) + ASCII string
        const algorithmId = Buffer.concat([
            Buffer.from([0x0d]), 
            Buffer.from('id-aes256-GCM', 'utf8')
        ]);

        // B. PartyU Info: "Apple"
        const partyU = Buffer.from('Apple', 'utf8');

        // C. PartyV Info: SHA-256 Hash of your Merchant ID
        //const partyV = crypto.createHash('sha256').update(merchantId, 'utf8').digest();
        // C. PartyV Info: Use the exact Hex Hash from your certificate
        const partyV = Buffer.from('8928F03D6C1E6413BD156F9F5A5B7DF4CABBCC35A978415D4451E42FCC2B5DA0', 'hex');

        // D. Combine Info
        const info = Buffer.concat([algorithmId, partyU, partyV]);

        // E. Calculate the hash: SHA256( Counter || SharedSecret || Info )
        // Counter is 0x00000001 (Fixed 4 bytes)
        const counter = Buffer.from([0x00, 0x00, 0x00, 0x01]);
        const kdfInput = Buffer.concat([counter, sharedSecret, info]);
        
        const derivedKeyHash = crypto.createHash('sha256').update(kdfInput).digest();
        
        // The Symmetric Key is the first 32 bytes of this hash
        const symmetricKey = derivedKeyHash.subarray(0, 32);

        // 6. Decrypt the Data (AES-256-GCM)
        const encryptedBytes = Buffer.from(data, 'base64');

        // Apple includes the Auth Tag (16 bytes) at the END of the data
        const authTagLength = 16;
        const ciphertext = encryptedBytes.subarray(0, encryptedBytes.length - authTagLength);
        const authTag = encryptedBytes.subarray(encryptedBytes.length - authTagLength);
        
        // Apple uses an empty IV (16 zero bytes)
        const iv = Buffer.alloc(16, 0);

        const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        // 7. Parse Result
        return JSON.parse(decrypted.toString('utf8'));

    } catch (err) {
        console.error("Decryption Failed:", err.message);
        // Common errors: "Invalid key encoding" (check your PEM file), 
        // "Unsupported state or unable to authenticate" (wrong key or corrupted data)
        return null;
    }
}
    */

export {applePayRouter}; 