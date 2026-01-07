import {Router} from 'express'
import fetch from 'node-fetch'

const flowRouter = Router();

// create payment session
flowRouter.post('/create-payment-session', async (req, res) => {

  req.body.processing_channel_id = req.get('Processing-Channel-Id')

  const url = 'https://api.sandbox.checkout.com/payment-sessions'
  const request = {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.get('Authorization') === 'sk_sbox_***************************' ? process.env.CKO_NAS_SECRET_KEY : req.get('Authorization')
    }
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

});

export {flowRouter}; 