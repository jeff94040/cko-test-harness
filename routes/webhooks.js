import {createHmac} from 'crypto'
import {Router} from 'express'
import mongoose from 'mongoose'

const webhooksRouter = Router();

// Database models
const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({ any: {} }))

// Webhook listener
webhooksRouter.post('/event-listener/:accountStructure', async (req, res) => {

  console.log('webhook received', req.body.id, req.body.type);

  // Verify authenticity of CKO event notification
  const server_signature = req.header('cko-signature'); // the cko-signature header
  const stringified_body = JSON.stringify(req.body); // the request body
  const hmac_password = process.env.CKO_NAS_WEBHOOK_KEY;

  const client_signature = createHmac('sha256', hmac_password)
    .update(stringified_body)
    .digest('hex');

  // if signature matches, write event to DB
  if(server_signature === client_signature){

    const event = new Event({any: {path: req.path, headers: req.headers, body: req.body}});

    try {
      await event.save();
      console.log('webhook written to database', req.body.id, req.body.type);
      res.status(200).end();
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }

  }
  else{
    console.log({
      result: 'signature mismatch',
      hmac_password: hmac_password,
      server_signature: server_signature,
      client_signature: client_signature,
      payload: req.body
    })
  }

});

// webhooks - return all events
webhooksRouter.get('/fetch-events', async (req, res) => {
  try {
    const events = await Event.find().sort({ _id: -1 });
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export {webhooksRouter};