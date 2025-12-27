import dotenv from 'dotenv'; 
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import {fileURLToPath} from 'url';

import {apmsRouter} from './routes/apms.js';
import {applePayRouter} from './routes/apple-pay.js';
import {googlePayRouter} from './routes/google-pay.js';
import {flowRouter} from './routes/flow.js';
import {plaidAchRouter} from './routes/plaid-ach.js';
import {siftRouter} from './routes/sift.js';
import {upapiRouter} from './routes/upapi.js';
import {webhooksRouter} from './routes/webhooks.js';

dotenv.config();

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
  '/eps': { view: 'eps' },
  '/events': { view: 'events' },
  '/failure': { view: 'failure' },
  '/giropay': { view: 'giropay' },
  '/iframe-wrapper': { view: 'iframe-wrapper' },
  '/pan-generator': { view: 'pan-generator' },
  '/paypal': { view: 'paypal' },
  '/plaid-ach': { view: 'plaid-ach' },
  '/sift': { view: 'sift' },
  '/success': { view: 'success' },
  '/trustly': { view: 'trustly' },
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
      merchantDecryptionMerchantId: process.env.APPLE_PAY_DECRYPTION_MERCHANT_ID
    }
  }
};

// Register all routes in one clean loop
Object.entries(pages).forEach(([route, config]) => {
  app.get(route, (req, res) => {
    res.render(config.view, config.data || {});
  });
});

app.use('/.well-known', express.static(path.join(__dirname, 'public', '.well-known')));

app.use('/', apmsRouter);
app.use('/', applePayRouter);
app.use('/', flowRouter);
app.use('/', googlePayRouter);
app.use('/', plaidAchRouter);
app.use('/', siftRouter)
app.use('/', upapiRouter);
app.use('/', webhooksRouter);

// Static Assets
app.use('/vendor/@faker-js/faker', express.static(path.join(__dirname, 'node_modules', '@faker-js', 'faker')));
app.use(express.static(path.join(__dirname, 'public'), {extensions: ['html'], index: false}));

const port = process.env.CKO_PORT || 3000;
app.listen(port, () => console.log(`Checkout app listening at http://localhost:${port}`));