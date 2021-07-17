import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch'; 
import mongoose from 'mongoose';

const router = express.Router();

// const webhookNotifications = './webhook-notifications.log';

const webhookSchema = new mongoose.Schema({any: {}});
const Webhook = mongoose.model('Webhook', webhookSchema);

// Render CKO Test Harness homepage
router.get('/', (req, res) => {
  res.render('index');
});

// Render Frames page
router.get('/frames', (req, res) => {
  res.render('frames', {key: process.env.CKO_API_PUBLIC});
});

// HPP result redirect
router.get('/hpp-result/:result', (req, res) => {
  res.render('hpp-result', {result: req.params.result});
});

// Webhook notification listener
router.post('/webhook-listener', (req, res) => {
  
  // fs.appendFile(webhookNotifications, JSON.stringify(req.body), (err) => {
  //   if(err) {
  //     res.status(500).end();
  //     throw err;
  //   }
  //   res.status(200).end();
  // });

  console.log('received webhook...');
  console.log(req.body);

  mongoose.connect('mongodb+srv://jeff:Fw1KpnkhzNvzSqnk@cluster0.3gcos.mongodb.net/cko_test_harness?authSource=admin&replicaSet=atlas-h15pmt-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('connected to database...');

    const webhook = new Webhook({any: req.body});

    webhook.save(function (err, webhook) {
      if(err) {
        res.status(500).end();
        return console.error(err);
      }
      console.log('wrote webhook to database...');
      res.status(200).end();
    });

  });
});

// Return webhook notifications
router.get('/webhook-notifications', (req, res) => {
  
  const events = fs.readFileSync(webhookNotifications, {encoding: 'utf-8'});

  res.render('webhook-notifications', {events: events});

});

router.get('/mongodb', (req, res) => {
/*
  mongoose.connect('mongodb+srv://jeff:Fw1KpnkhzNvzSqnk@cluster0.3gcos.mongodb.net/cko_test_harness?authSource=admin&replicaSet=atlas-h15pmt-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('we are connected!!');
    const webhookSchema = new mongoose.Schema({any: {}});

    // kittySchema.methods.speak = function () {
    //   const greeting = this.name ? "Meow name is " + this.name : "I don't have a name";
    //   console.log(greeting);
    // };

    const Webhook = mongoose.model('Webhook', webhookSchema);

    const webhook = new Webhook({any: {"id":"evt_g7dferlwdghudjxjhpjer6rixe","type":"payment_paid","created_on":"2021-07-01T20:50:53Z","data":{"action_id":"act_pjfe2dn7eraejhsvtc7u7tm76u","auth_code":"323163","response_code":"10000","response_summary":"Approved","amount":1000,"metadata":{},"destination":{"id":"src_z4dbhwyq5v2uznycg7tveuvp3m","type":"card","expiry_month":12,"expiry_year":2030,"name":"John Doe","scheme":"Visa","last_4":"4242","fingerprint":"0b8cdac052322fc6061aa358aeb0bd65436c95b62e1808d05940b294c902fb81","bin":"424242","card_type":"Credit","card_category":"Consumer","issuer":"JPMORGAN CHASE BANK NA","issuer_country":"US","product_id":"A","product_type":"Visa Traditional","avs_check":"S","cvv_check":"Y"},"customer":{"id":"cus_gmag4eabtcpufndrwpnaiibphu"},"id":"pay_iitlf7c4vdxmfjircd4q4vauty","currency":"EUR","processed_on":"2021-07-01T20:51:00Z"},"_links":{"self":{"href":"https://api.sandbox.checkout.com/events/evt_g7dferlwdghudjxjhpjer6rixe"},"payment":{"href":"https://api.sandbox.checkout.com/payments/pay_iitlf7c4vdxmfjircd4q4vauty"}}}});

    webhook.save(function (err, webhook) {
      if(err) return console.error(err);
      console.log('wrote webhook to database!');
    });

    Webhook.find(function (err, webhooks) {
      if (err) return console.error(err);
      console.log(webhooks);
    });

  });
  */
  res.render('mongodb');

});

// REST API listens for async fetch() requests from client browser & invokes CKO API
router.post('/fetch-api-request', async (req, res) => {

  let key;
  if(req.body.path === '/payment-links' || req.body.path === '/hosted-payments')
    key = process.env.CKO_HPP_LINKS_SECRET;
  else if(req.body.path === '/tokens')
    key = process.env.CKO_HPP_LINKS_PUBLIC;
  else
    key = process.env.CKO_API_SECRET;

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

export {router};