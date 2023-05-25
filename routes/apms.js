import dotenv from 'dotenv'; 
import express from 'express';
import fetch from 'node-fetch';
import { generateReference } from '../util.js';

const apmsRouter = express.Router();

dotenv.config();

apmsRouter.post('/create-apm-url', async (req, res) => {

  const apm = req.body.source.type
  req.body.reference = generateReference(6)

  if(apm === 'eps' || apm === 'giropay' || apm === 'trustly')
    req.body.processing_channel_id = process.env.CKO_EEA_PROCESSING_CHANNEL_ID
  else
    req.body.processing_channel_id = process.env.CKO_NAS_PROCESSING_CHANNEL_ID

  const response = await (await fetch('https://api.sandbox.checkout.com/payments', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  })).json()
  console.log(`create apm url response: ${JSON.stringify(response)}`);

  res.status(200).json(response)

})

export {apmsRouter}; 