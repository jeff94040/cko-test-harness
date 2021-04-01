import express from 'express';
import {router} from './routes.js';

const app = express();
const port = process.env.CKO_PORT;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

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