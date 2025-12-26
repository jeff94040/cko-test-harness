import dotenv from 'dotenv'; 
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import {apmsRouter} from './routes/apms.js';
import {applePayRouter} from './routes/apple-pay.js';
import {fileURLToPath} from 'url';
import {flowRouter} from './routes/flow.js';
import {plaidAchRouter} from './routes/plaid-ach.js';
import {siftRouter} from './routes/sift.js';
import {upapiRouter} from './routes/upapi.js';
import {webhooksRouter} from './routes/webhooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.disable('x-powered-by');

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

// if you use inline scripts / EJS
app.use(helmet({contentSecurityPolicy: false }));

// Trust front-facing proxies 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

app.set('view engine', 'ejs');

const pages = {
  '/': 'index',
  '/braintree': 'braintree',
  '/eps': 'eps',
  '/events': 'events',
  '/failure': 'failure',
  '/giropay': 'giropay',
  '/iframe-wrapper': 'iframe-wrapper',
  '/pan-generator': 'pan-generator',
  '/paypal': 'paypal',
  '/plaid-ach': 'plaid-ach',
  '/sift': 'sift',
  '/success': 'success',
  '/trustly': 'trustly',
};

Object.entries(pages).forEach(([route, view]) => {
  app.get(route, (req, res) => res.render(view));
});

app.get('/apple-pay', (req, res) => {
    res.render('apple-pay', { 
      checkoutDecryptionMerchantId: process.env.APPLE_PAY_MERCHANT_ID, 
      merchantDecryptionMerchantId: process.env.APPLE_PAY_DECRYPTION_MERCHANT_ID
    });
});

app.get('/flow', (req, res) => {
    res.render('flow', { 
      processingChannelId: process.env.CKO_NAS_PROCESSING_CHANNEL_ID, 
      publicKey: process.env.CKO_NAS_PUBLIC_KEY
    });
});

app.get('/frames-single', (req, res) => {
    res.render('frames-single', { 
      publicKey: process.env.CKO_NAS_PUBLIC_KEY
    });
});

app.get('/frames-multiple', (req, res) => {
    res.render('frames-multiple', { 
      publicKey: process.env.CKO_NAS_PUBLIC_KEY
    });
});

app.get('/risk-js', (req, res) => {
    res.render('risk-js', { 
      publicKey: process.env.CKO_NAS_PUBLIC_KEY
    });
});

app.get('/apple-developer-merchantid-domain-association.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '.well-known', 'apple-developer-merchantid-domain-association.txt'));
});

// no longer needed due to domain file requirement fix for Flow
//app.get('/apple-developer-merchantid-domain-association', (req, res) => {res.sendFile('/home/jeff/apps/cko-test-harness/public/.well-known/apple-developer-merchantid-domain-association')})

app.use('/', apmsRouter);
app.use('/', applePayRouter);
app.use('/', plaidAchRouter);
app.use('/', upapiRouter);
app.use('/', webhooksRouter);
app.use('/', siftRouter)
app.use('/', flowRouter);

// Serve only faker from node_modules under /vendor
app.use('/vendor/@faker-js/faker', express.static(path.join(__dirname, 'node_modules', '@faker-js', 'faker')));

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  index: false
}));

const port = process.env.CKO_PORT;
if (!port) {
  console.error("ERROR: CKO_PORT is not set in .env");
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Checkout app listening at http://localhost:${port}`)
});