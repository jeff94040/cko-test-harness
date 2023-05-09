import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch'; 

//import config props from .env file
dotenv.config();

const paypalRouter = express.Router();

// paypal - create order
paypalRouter.get('/paypal-create-order', async (req, res) => {
  
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
  console.log(`response from /payments: ${JSON.stringify(createOrderResponse)}`);

//  res.send(createOrderResponse.processing.order_id)
res.status(200).json(createOrderResponse)

})

export {paypalRouter};