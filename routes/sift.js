import express from 'express';

const siftRouter = express.Router();

siftRouter.get('/sift/:property', (req, res) => {
  if (req.params.property === 'beacon-key')
    res.send(process.env.SIFT_BEACON_KEY)
  else if (req.params.property === 'user-id')
    res.send(process.env.SIFT_USER_ID)
  else
    res.status(400)
})

export {siftRouter}; 