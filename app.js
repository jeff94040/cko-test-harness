import express from 'express';
import {apmsRouter} from './routes/apms.js';
import {applePayRouter} from './routes/apple-pay.js';
import {framesRouter} from './routes/frames.js';
import {plaidAchRouter} from './routes/plaid-ach.js';
import {upapiRouter} from './routes/upapi.js';
import {webhooksRouter} from './routes/webhooks.js';
import {siftRouter} from './routes/sift.js';
import {flowRouter} from './routes/flow.js';

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

app.set('view engine', 'ejs')

app.get('/apple-pay', (req, res) => {res.render('apple-pay')})
app.get('/braintree', (req, res) => {res.render('braintree')})
app.get('/eps', (req, res) => {res.render('eps')})
app.get('/events', (req, res) => {res.render('events')})
app.get('/failure', (req, res) => {res.render('failure')})
app.get('/frames-single', (req, res) => {res.render('frames-single')})
app.get('/frames-multiple', (req, res) => {res.render('frames-multiple')})
app.get('/giropay', (req, res) => {res.render('giropay')})
app.get('/iframe-wrapper', (req, res) => {res.render('iframe-wrapper')})
app.get('/', (req, res) => {res.render('index')})
app.get('/pan-generator', (req, res) => {res.render('pan-generator')})
app.get('/flow', (req, res) => {res.render('flow')})
app.get('/paypal', (req, res) => {res.render('paypal')})
app.get('/plaid-ach', (req, res) => {res.render('plaid-ach')})
app.get('/risk-js', (req, res) => {res.render('risk-js')})
app.get('/sift', (req, res) => {res.render('sift')})
app.get('/success', (req, res) => {res.render('success')})
app.get('/trustly', (req, res) => {res.render('trustly')})

app.get('/apple-developer-merchantid-domain-association.txt', (req, res) => {res.sendFile('/home/jeff/apps/cko-test-harness/public/.well-known/apple-developer-merchantid-domain-association.txt')})

app.get('/apple-developer-merchantid-domain-association', (req, res) => {res.sendFile('/home/jeff/apps/cko-test-harness/public/.well-known/apple-developer-merchantid-domain-association')})


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
app.use(express.static('public/js'));
app.use(express.static('public'));
app.use(express.static('node_modules'))

app.listen(port, () => {
  console.log(`Checkout app listening at http://localhost:${port}`)
});