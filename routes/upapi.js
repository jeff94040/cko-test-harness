import {Router} from 'express'
import fetch from 'node-fetch' 

const upapiRouter = Router();

// REST API listens for async fetch() requests from client browser & invokes CKO API
upapiRouter.post('/fetch-api-request', async (req, res) => {

  // add processing channel to all requests
  req.body.body['processing_channel_id'] = process.env.CKO_NAS_PROCESSING_CHANNEL_ID
  
  const data = {
    method: req.body.verb,
    headers: {
      'Authorization': process.env.CKO_NAS_SECRET_KEY,
      'Content-Type': 'application/json'
    },
    body: req.body.verb === 'GET' ? null : JSON.stringify(req.body.body)
  }

  try {
    // Invoke HTTP request to CKO REST API
    const response = await fetch(`${req.body.domain}${req.body.path}`, data);

    // Parse and handle reply from CKO REST API
    if (response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')){
      const body = await response.json();
      res.send({status: response.status, statusText: response.statusText, body: body});        
    }
    else{
      res.send({status: response.status, statusText: response.statusText, body: {}});   
    }
  }
  catch (error) {
    console.error('status: exception');
    console.error(`error: ${error}`);
    res.send({status: 'exception', body: error});
  }
});

export {upapiRouter};