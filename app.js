import express from 'express';
import {apmsRouter} from './routes/apms.js';
import {applePayRouter} from './routes/apple-pay.js';
import {framesRouter} from './routes/frames.js';
import {plaidAchRouter} from './routes/plaid-ach.js';
import {upapiRouter} from './routes/upapi.js';
import {webhooksRouter} from './routes/webhooks.js';
import {siftRouter} from './routes/sift.js';
import {paymentComponentsRouter} from './routes/payment-components.js';

import dotenv from 'dotenv'; 

//import config props from .env file
dotenv.config();

var app = express();
const port = process.env.CKO_PORT;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

// Session middleware
//app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

// Trust front-facing proxies 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
app.set('trust proxy', 'uniquelocal');

app.use('/', apmsRouter);
app.use('/', applePayRouter);
app.use('/', framesRouter);
app.use('/', plaidAchRouter);
app.use('/', upapiRouter);
app.use('/', webhooksRouter);
app.use('/', siftRouter)
app.use('/', paymentComponentsRouter);

// Set folder location for static content
app.use(express.static('public/html', {extensions: 'html'}));
app.use(express.static('public/js'));
app.use(express.static('public'));
app.use(express.static('node_modules'))

app.listen(port, () => {
  console.log(`Checkout app listening at http://localhost:${port}`)
});