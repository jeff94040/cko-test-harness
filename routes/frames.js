import dotenv from 'dotenv'; 
import express from 'express';

const framesRouter = express.Router();

//import config props from .env file
dotenv.config();

// return public key
framesRouter.get('/frames-key', (req, res) => {
  res.send(process.env.CKO_NAS_PUBLIC_KEY)
});

export {framesRouter};