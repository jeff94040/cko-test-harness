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

  var options = {
    method: 'POST', 
    body: JSON.stringify(req.body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    }
  }

  console.log(`url: ${url}`)
  console.log(options)

  const httpResponse = await fetch(url, options)
  console.log(httpResponse)

  const parsedResponse = await httpResponse.json()
  console.log(parsedResponse)

  //const response = await (await fetch(url, options)).json()
  console.log(`create apm url response: ${JSON.stringify(parsedResponse)}`);

  res.status(200).json(parsedResponse)

})

export {apmsRouter}; 