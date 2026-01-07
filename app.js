import 'dotenv/config'

import express from 'express';
import helmet from 'helmet';
import path from 'path';
import {fileURLToPath} from 'url';
import mongoose from 'mongoose'; // 1. Added mongoose import

import {paypalRouter} from './routes/paypal.js';
import {applePayRouter} from './routes/apple-pay.js';
import {googlePayRouter} from './routes/google-pay.js';
import {flowRouter} from './routes/flow.js';
import {plaidAchRouter} from './routes/plaid-ach.js';
import {siftRouter} from './routes/sift.js';
import {upapiRouter} from './routes/upapi.js';
import {webhooksRouter} from './routes/webhooks.js';

const requiredKeys = [
  'CKO_PORT',
  'CKO_NAS_PROCESSING_CHANNEL_ID',
  'CKO_NAS_SECRET_KEY', 
  'CKO_NAS_PUBLIC_KEY', 
  'MONGO_DB_NAME',
  'MONGO_DB_USER',
  'MONGO_DB_PASSWORD',
  'MONGO_DB_CLUSTER_DOMAIN'
];

requiredKeys.forEach(key => {
  if (!process.env[key]) {
    console.warn(`[WARNING]: Missing environment variable: ${key}`);
  }
});

// 2. Database Connection Logic
const mongoUri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_CLUSTER_DOMAIN}/`;
mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB_NAME })
  .then(() => console.log('Connected to MongoDB via app.js'))
  .catch(err => console.error('MongoDB connection error:', err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Enhanced Security
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy: false }));

// Express, EJS
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.set('view engine', 'ejs');
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

const pages = {
  '/': { view: 'index' },
  '/braintree': { view: 'braintree' },
  '/events': { view: 'events' },
  '/failure': { view: 'failure' },
  '/iframe-wrapper': { view: 'iframe-wrapper' },
  '/pan-generator': { view: 'pan-generator' },
  '/paypal': { 
    view: 'paypal', 
    data: { 
      paypalMerchantId: process.env.PAYPAL_MERCHANT_ID,
      paypalClientId: process.env.PAYPAL_CLIENT_ID
     }
  },
  '/plaid-ach': { view: 'plaid-ach' },
  '/sift': { view: 'sift' },
  '/success': { view: 'success' },
  '/frames-single': { 
    view: 'frames-single', 
    data: { publicKey: process.env.CKO_NAS_PUBLIC_KEY } 
  },
  '/google-pay': { 
    view: 'google-pay', 
    data: { publicKey: process.env.CKO_NAS_PUBLIC_KEY } 
  },
  '/frames-multiple': { 
    view: 'frames-multiple', 
    data: { publicKey: process.env.CKO_NAS_PUBLIC_KEY } 
  },
  '/risk-js': { 
    view: 'risk-js', 
    data: { publicKey: process.env.CKO_NAS_PUBLIC_KEY } 
  },
  '/flow': { 
    view: 'flow', 
    data: { 
      publicKey: process.env.CKO_NAS_PUBLIC_KEY, 
      processingChannelId: process.env.CKO_NAS_PROCESSING_CHANNEL_ID 
    } 
  },
  '/apple-pay': {
    view: 'apple-pay',
    data: {
      checkoutDecryptionMerchantId: process.env.APPLE_PAY_MERCHANT_ID, 
      merchantDecryptionMerchantId: process.env.APPLE_PAY_DECRYPTION_MERCHANT_ID,
      publicKey: process.env.CKO_NAS_PUBLIC_KEY
    }
  }
};

// Register all routes in one clean loop
Object.entries(pages).forEach(([route, config]) => {
  app.get(route, (req, res) => {
    res.render(config.view, config.data || {});
  });
});


app.use('/', applePayRouter);
app.use('/', flowRouter);
app.use('/', googlePayRouter);
app.use('/', paypalRouter);
app.use('/', plaidAchRouter);
app.use('/', siftRouter)
app.use('/', upapiRouter);
app.use('/', webhooksRouter);

// Static Assets
app.use('/vendor/@faker-js/faker', express.static(path.join(__dirname, 'node_modules', '@faker-js', 'faker')));
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  index: false
}));

const port = process.env.CKO_PORT || 3000;
app.listen(port, () => console.log(`Checkout app listening at http://localhost:${port}`));