import express from 'express';
import {router} from './routes.js';
import dotenv from 'dotenv'; 

//import config props from .env file
dotenv.config();

var app = express();
const port = process.env.CKO_PORT;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

// Trust front-facing proxies 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
app.set('trust proxy', 'uniquelocal');

// Set default views folder to views
app.set('views', 'views');

// Set view engine to EJS
app.set('view engine', 'ejs');

// Set folder location for static content
app.use(express.static('public'));

app.use('/', router);

app.listen(port, () => {
  console.log(`Checkout app listening at http://localhost:${port}`)
});