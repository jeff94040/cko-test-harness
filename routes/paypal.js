import {Router} from 'express'
import {faker} from '@faker-js/faker'
import fetch from 'node-fetch'

const paypalRouter = Router();

paypalRouter.post('/paypal-payment-context', async (req, res) => {

  req.body.reference = `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`
  req.body.success_url = process.env.SUCCESS_URL
  req.body.failure_url = process.env.FAILURE_URL
  req.body.capture = 'true'
  req.body.processing_channel_id = process.env.CKO_NAS_PROCESSING_CHANNEL_ID

  const url = 'https://api.sandbox.checkout.com/payment-contexts'
  const request = {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.CKO_NAS_SECRET_KEY
    },
    body: JSON.stringify(req.body)
  }

  try{
    const rawResponse = await fetch(url, request);
    if (!rawResponse.ok) { throw { url: url, status: rawResponse.status, statusText: rawResponse.statusText, details: await rawResponse.text() } }

    const response = await rawResponse.json()
    console.log({url: url, status: rawResponse.status, response: response})

    res.json(response)
  } catch (error) {
    console.error(error)
    res.status(error.status || 500).end()
  }

})

paypalRouter.post('/paypal-payment', async (req, res) => {

  const url = 'https://api.sandbox.checkout.com/payments'
  const request = {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${process.env.CKO_NAS_SECRET_KEY}`
    },
    body: JSON.stringify({
      'payment_context_id': req.body.contextID,
      'processing_channel_id': process.env.CKO_NAS_PROCESSING_CHANNEL_ID
    })
  }

  try{
    const rawResponse = await fetch(url, request);
    if (!rawResponse.ok) { throw { url: url, status: rawResponse.status, statusText: rawResponse.statusText, details: await rawResponse.text() } }

    const response = await rawResponse.json()
    console.log({url: url, status: rawResponse.status, response: response})

    res.json(response)
  } catch (error) {
    console.error(error)
    res.status(error.status || 500).end()
  }

})

export {paypalRouter}; 