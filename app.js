import express from 'express';
import {apmsRouter} from './routes/apms.js';
import {applePayRouter} from './routes/apple-pay.js';
import {framesRouter} from './routes/frames.js';
import {plaidAchRouter} from './routes/plaid-ach.js';
import {upapiRouter} from './routes/upapi.js';
import {webhooksRouter} from './routes/webhooks.js';
import {siftRouter} from './routes/sift.js';
import {flowRouter} from './routes/flow.js';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv'; 

//import config props from .env file
dotenv.config();

const app = express();
const port = process.env.CKO_PORT;
if (!port) {
  console.error("ERROR: CKO_PORT is not set in .env");
  process.exit(1);
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

// Trust front-facing proxies 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
app.set('trust proxy', 'uniquelocal');

app.set('view engine', 'ejs')

const pages = [
  'apple-pay', 'braintree', 'eps', 'events', 'failure',
  'frames-single', 'frames-multiple', 'giropay', 'iframe-wrapper',
  'index', 'pan-generator', 'flow', 'paypal', 'plaid-ach',
  'risk-js', 'sift', 'success', 'trustly'
];

pages.forEach(page => {
  app.get(`/${page === 'index' ? '' : page}`, (req, res) => {
    res.render(page);
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// unsafe
//app.get('/apple-developer-merchantid-domain-association.txt', (req, res) => {res.sendFile('/home/jeff/apps/cko-test-harness/public/.well-known/apple-developer-merchantid-domain-association.txt')})
app.get('/apple-developer-merchantid-domain-association.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '.well-known', 'apple-developer-merchantid-domain-association.txt'));
});

// no longer needed due to domain file requirement fix for Flow
//app.get('/apple-developer-merchantid-domain-association', (req, res) => {res.sendFile('/home/jeff/apps/cko-test-harness/public/.well-known/apple-developer-merchantid-domain-association')})

app.use('/', apmsRouter);
app.use('/', applePayRouter);
app.use('/', framesRouter);
app.use('/', plaidAchRouter);
app.use('/', upapiRouter);
app.use('/', webhooksRouter);
app.use('/', siftRouter)
app.use('/', flowRouter);

// Set folder location for static content
//app.use(express.static('public/html', {extensions: 'html'}));


// unsafe
/*
app.use(express.static('public/js'));
app.use(express.static('public'));
app.use(express.static('node_modules'))
*/
// Serve only faker from node_modules under /vendor
app.use(
  '/vendor/@faker-js/faker',
  express.static(path.join(__dirname, 'node_modules', '@faker-js', 'faker'))
);

//app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
//app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
//app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Checkout app listening at http://localhost:${port}`)
});