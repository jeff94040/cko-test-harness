import express from 'express';
import {applePayRouter} from './routes/apple-pay.js';
import {framesRouter} from './routes/frames.js';
import {paypalRouter} from './routes/paypal.js';
import {plaidAchRouter} from './routes/plaid-ach.js';
import {upapiRouter} from './routes/upapi.js';
import {webhooksRouter} from './routes/webhooks.js';

import dotenv from 'dotenv'; 

//import config props from .env file
dotenv.config();

var app = express();
const port = process.env.CKO_PORT;

// Set folder location for static content
app.use(express.static('public/html', {extensions: 'html'}));
app.use(express.static('public/js'));
app.use(express.static('public'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

// Trust front-facing proxies 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
app.set('trust proxy', 'uniquelocal');

app.use('/', applePayRouter);
app.use('/', framesRouter);
app.use('/', paypalRouter);
app.use('/', plaidAchRouter);
app.use('/', upapiRouter);
app.use('/', webhooksRouter);

app.listen(port, () => {
  console.log(`Checkout app listening at http://localhost:${port}`)
});