import dotenv from 'dotenv'; 
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import {apmsRouter} from './routes/apms.js';
import {applePayRouter} from './routes/apple-pay.js';
import {fileURLToPath} from 'url';
import {flowRouter} from './routes/flow.js';
import {framesRouter} from './routes/frames.js';
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
  '/apple-pay': 'apple-pay',
  '/braintree': 'braintree',
  '/eps': 'eps',
  '/events': 'events',
  '/failure': 'failure',
  '/flow': 'flow',
  '/frames-single': 'frames-single',
  '/frames-multiple': 'frames-multiple',
  '/giropay': 'giropay',
  '/iframe-wrapper': 'iframe-wrapper',
  '/pan-generator': 'pan-generator',
  '/paypal': 'paypal',
  '/plaid-ach': 'plaid-ach',
  '/risk-js': 'risk-js',
  '/sift': 'sift',
  '/success': 'success',
  '/trustly': 'trustly',
};

Object.entries(pages).forEach(([route, view]) => {
  app.get(route, (req, res) => res.render(view));
});

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