import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch'; 
import mongoose from 'mongoose';

const router = express.Router();

// const webhookNotifications = './webhook-notifications.log';

const webhookSchema = new mongoose.Schema({any: {}});
const Webhook = mongoose.model('Webhook', webhookSchema);

const mongo_db_name = process.env.MONGO_DB_NAME;
const mongo_db_user = process.env.MONGO_DB_USER;
const mongo_db_password = process.env.MONGO_DB_PASSWORD;

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

  console.log('received webhook...');
  console.log(req.body);

  mongoose.connect(`mongodb+srv://${mongo_db_user}:${mongo_db_password}@cluster0.3gcos.mongodb.net/${mongo_db_name}?authSource=admin&replicaSet=atlas-h15pmt-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

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
  
  // const events = fs.readFileSync(webhookNotifications, {encoding: 'utf-8'});
  mongoose.connect(`mongodb+srv://${mongo_db_user}:${mongo_db_password}@cluster0.3gcos.mongodb.net/${mongo_db_name}?authSource=admin&replicaSet=atlas-h15pmt-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', function() {
    console.log('we are connected!!');

    Webhook.find(function (err, webhooks) {
      if (err) return console.error(err);
      console.log(webhooks);
      res.status(200).json(webhooks);
    });

  });

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