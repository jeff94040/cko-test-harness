import crypto from 'crypto'
import express from 'express'
import mongoose from 'mongoose'

const webhooksRouter = express.Router();

// mongo database credentials
const mongo_db_user = process.env.MONGO_DB_USER;
const mongo_db_password = process.env.MONGO_DB_PASSWORD;
const mongo_db_cluster_domain = process.env.MONGO_DB_CLUSTER_DOMAIN;
const mongo_db_name = process.env.MONGO_DB_NAME;

// database schema
const eventSchema = new mongoose.Schema({any: {}});
const keySchema = new mongoose.Schema({structure: String, secret_key: String, public_key: String});

// database model
const Event = mongoose.model('Event', eventSchema);
const Key = mongoose.model('Key', keySchema);

// initialize database connection
mongoose.connect(`mongodb+srv://${mongo_db_user}:${mongo_db_password}@${mongo_db_cluster_domain}/${mongo_db_name}`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

// connection object
const db = mongoose.connection;

// fires on database connection error
db.on('error', console.error.bind(console, 'connection error:'));

// fires on successful database connection
db.once('open', function() { console.log(`Connected to mongodb+srv://${mongo_db_user}:*****@${mongo_db_cluster_domain}/${mongo_db_name}`) });

// webhook listener
webhooksRouter.post('/event-listener/:accountStructure', (req, res) => {

  console.log(`received ${req.params.accountStructure} event notification...`);
  //console.log(req.headers);
  //console.log(req.body);

  // Verify authenticity of CKO event notification

  const server_signature = req.header('cko-signature'); // the cko-signature header
  const stringified_body = JSON.stringify(req.body); // the request body
  
  const hmac_password = process.env.CKO_NAS_WEBHOOK_KEY;

  const client_signature = crypto.createHmac('sha256', hmac_password)
    .update(stringified_body)
    .digest('hex');

  // if signature matches, write event to DB
  if(server_signature === client_signature){

    //console.log('signature match...');

    const event = new Event({any: {path: req.path, headers: req.headers, body: req.body}});

    event.save(function (err, event) {
      if(err) {
        res.status(500).end();
        return console.error(err);
      }
      console.log('wrote event to database...');
      res.status(200).end();
    });

  }
  else{
    console.log('signature mismatch...');
    console.log('server signature: ' + server_signature);
    console.log('client signature: ' + client_signature);
  }

});

// webhooks - return all events
webhooksRouter.get('/fetch-events', (req, res) => {  
  Event.find(function (err, events) {
    if (err) return console.error(err);
    res.status(200).json(events);
  }).sort({_id: -1});

});

export {webhooksRouter};