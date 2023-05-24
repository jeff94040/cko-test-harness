import express from 'express';

const siftRouter = express.Router();

siftRouter.get('/sift-session-id', async (req, res) => {

  //console.log(req)
  res.status(200)
})

export {siftRouter}; 