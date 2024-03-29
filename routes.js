import express from 'express';
import fetch from 'node-fetch'; 
import https from 'node:https';
import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import { create } from 'node:domain';

//import config props from .env file
dotenv.config();

const router = express.Router();

// mongo database credentials
const mongo_db_user = process.env.MONGO_DB_USER;
const mongo_db_password = process.env.MONGO_DB_PASSWORD;
const mongo_db_cluster_domain = process.env.MONGO_DB_CLUSTER_DOMAIN;
const mongo_db_name = process.env.MONGO_DB_NAME;

// database schema
const eventSchema = new mongoose.Schema({any: {}});
const keySchema = new mongoose.Schema({structure: String, secret_key: String, public_key: String});

// database model
const Event = mongoose.model('Event', eventSchema);
const Key = mongoose.model('Key', keySchema);

// initialize database connection
mongoose.connect(`mongodb+srv://${mongo_db_user}:${mongo_db_password}@${mongo_db_cluster_domain}/${mongo_db_name}`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

// connection object
const db = mongoose.connection;

// fires on database connection error
db.on('error', console.error.bind(console, 'connection error:'));

// fires on successful database connection
db.once('open', function() { console.log(`Connected to mongodb+srv://${mongo_db_user}:*****@${mongo_db_cluster_domain}/${mongo_db_name}`) });

/***** page rendering routes *****/

// render index
router.get('/', (req, res) => {
  res.render('index');
});

// render frames
router.get('/frames', (req, res) => {
  res.render('frames');
});

// render events
router.get('/events', (req, res) => {
  res.render('events');
});

// render pan generator
router.get('/pan-generator', (req, res) => {
  res.render('pan-generator');
});

// render plaid-ach
router.get('/plaid-ach', (req, res) => {
  res.render('plaid-ach');
});

// render risk.js
router.get('/risk-js', (req, res) => {
  res.render('risk-js');
});

// render paypal
router.get('/paypal', (req, res) => {
  res.render('paypal')
})

// render apple pay
router.get('/apple-pay', (req, res) => {
  res.render('apple-pay');
});

/***** return text values *****/

// return public key
router.get('/frames-key', (req, res) => {
  res.send(process.env.CKO_NAS_PUBLIC_KEY)
});

// apple pay - return merchant id
router.get('/apple-pay-merchant-id', (req, res) => {
  res.send(process.env.APPLE_PAY_MERCHANT_ID)
})

/***** functional post routes *****/

// apple pay - create custom agent and validate session
router.post('/apple-pay-validate-session', async (req, res) => {

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
      displayName: process.env.APPLE_PAY_DISPLAY_NAME
    }),
    headers: {'Content-Type': 'application/json'},
    agent: httpsAgent
  })).json()

  res.status(200).json(validateSessionResponse)
})

// apple pay - request payment
router.post('/apple-pay-payment', async (req, res) => {

  // apple pay - create cko token
  const createTokenResponse = await (await fetch('https://api.sandbox.checkout.com/tokens', {
    method: 'POST',
    body: JSON.stringify({
      'type': 'applepay',
      'token_data': req.body.token.paymentData
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_PUBLIC_KEY}`
    }
  })).json()

  // apple pay - submit payment
  const paymentResponse = await (await fetch('https://api.sandbox.checkout.com/payments', {
    method: 'POST',
    body: JSON.stringify({
      'source': {
        'type': 'token',
        'token': createTokenResponse.token
      },
      'amount': 300,
      'currency': 'USD',
      'reference': `REF-${gen_ref(6)}`,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  })).json()

  res.status(200).json(paymentResponse)
})

// webhook listener
router.post('/event-listener/:accountStructure', (req, res) => {

  console.log(`received ${req.params.accountStructure} event notification...`);
  //console.log(req.headers);
  //console.log(req.body);

  // Verify authenticity of CKO event notification

  const server_signature = req.header('cko-signature'); // the cko-signature header
  const stringified_body = JSON.stringify(req.body); // the request body
  
  const hmac_password = process.env.CKO_NAS_WEBHOOK_KEY;

  const client_signature = crypto.createHmac('sha256', hmac_password)
    .update(stringified_body)
    .digest('hex');

  // if signature matches, write event to DB
  if(server_signature === client_signature){

    //console.log('signature match...');

    const event = new Event({any: {path: req.path, headers: req.headers, body: req.body}});

    event.save(function (err, event) {
      if(err) {
        res.status(500).end();
        return console.error(err);
      }
      console.log('wrote event to database...');
      res.status(200).end();
    });

  }
  else{
    console.log('signature mismatch...');
    console.log('server signature: ' + server_signature);
    console.log('client signature: ' + client_signature);
  }

});

// paypal - create order
router.get('/paypal-create-order', async (req, res) => {
  
  const createOrderResponse = await (await fetch('https://api.sandbox.checkout.com/payments', {
    method: 'POST',
    body: JSON.stringify({
      source: {
          type: 'paypal'
      },
      currency: 'USD',
      amount: 3000,
      items: [
          {
          name: 'laptop',
          unit_price: 2000,
          quantity: 1
          },
         {
          name: 'desktop',
          unit_price: 1000,
          quantity: 1
          }        
      ],
      processing_channel_id: `${process.env.CKO_NAS_PROCESSING_CHANNEL_ID}`,
      success_url: 'http://www.example.com/success.html',
      failure_url: 'http://www.example.com/failure.html'
  }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  })).json()

  res.send(createOrderResponse.processing.order_id)
})

// plaid - create link token
router.get('/plaid/link-token', async (req, res) => {

  const tokenCreateResponse = await (await fetch('https://sandbox.plaid.com/link/token/create', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SANDBOX_KEY,
      user: {
        client_user_id: "client_user_id_1"
      },
      client_name: "Jeff's CKO Test Harness",
      products: ["auth"],
      country_codes: ["US"],
      language: "en"
    }),
    headers: {'Content-Type': 'application/json'}
  })).json()
  console.log(`response from /link/token/create: ${JSON.stringify(tokenCreateResponse)}`);
  res.status(200).json(tokenCreateResponse);

});

// plaid - token exchange and payment
router.post('/plaid/access-token', async (req, res) => {

  const exchangeResponse = await (await fetch('https://sandbox.plaid.com/item/public_token/exchange', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SANDBOX_KEY,
      public_token: req.body.public_token}),
    headers: {'Content-Type': 'application/json'}
  })).json()
  console.log(`response from /item/public_token/exchange: ${JSON.stringify(exchangeResponse)}`);

  const processorTokenResponse = await (await fetch('https://sandbox.plaid.com/processor/token/create', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SANDBOX_KEY,
      access_token: exchangeResponse.access_token,
      account_id: req.body.account_id,
      processor: 'checkout'}),
    headers: {'Content-Type': 'application/json'}
  })).json()
  console.log(`response from /processor/token/create: ${JSON.stringify(processorTokenResponse)}`);

  const paymentResponse = await (await fetch('https://api.sandbox.checkout.com/payments', {
    method: 'POST',
    body: JSON.stringify({
      source: {
          type: 'provider_token',
          payment_method: 'ach',
          token: processorTokenResponse.processor_token,
          account_holder: {
              type: 'Individual'
          }
      },
      amount: 4500,
      currency: 'USD',
      reference: `REF-${gen_ref(6)}`,
      processing_channel_id: process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  })).json()
  console.log(`response from /payments: ${JSON.stringify(paymentResponse)}`);

  res.status(200).json(paymentResponse);
});

// webhooks - return all events
router.post('/fetch-events', (req, res) => {

  // console.log('request received @ /fetch-events');
  
  Event.find(function (err, events) {
    if (err) return console.error(err);
    // console.log(events);
    // console.log('sending response from /fetch-events');
    res.status(200).json(events);
  }).sort({_id: -1});

});

// REST API listens for async fetch() requests from client browser & invokes CKO API
router.post('/fetch-api-request', async (req, res) => {

  // default key to sk, reassign to pk for /tokens endpoint only
  let key = process.env.CKO_NAS_SECRET_KEY;
  if(req.body.path === '/tokens')
    key = process.env.CKO_NAS_PUBLIC_KEY;

  // add processing channel to all requests
  req.body.body['processing_channel_id'] = process.env.CKO_NAS_PROCESSING_CHANNEL_ID
  
  const data = {
    method: req.body.verb,
    headers: {
      'Authorization': key,
      'Content-Type': 'application/json'
    },
    body: req.body.verb === 'GET' ? null : JSON.stringify(req.body.body)
  }

  try {
    // Invoke HTTP request to CKO REST API
    const response = await fetch(`${req.body.domain}${req.body.path}`, data);

    // Parse and handle reply from CKO REST API
    if (response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')){
      const body = await response.json();
      res.send({status: response.status, statusText: response.statusText, body: body});        
    }
    else{
      res.send({status: response.status, statusText: response.statusText, body: {}});   
    }
  }
  catch (error) {
    console.error('status: exception');
    console.error(`error: ${error}`);
    res.send({status: 'exception', body: error});
  }
});

// helper function to generate a random reference
function gen_ref(length){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for ( let i = 0; i < length; i++ )
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export {router};