## Overview

cko-test-harness is a web implementation of Checkout.com's UI-based products. The live web application runs at https://cko.jeff94040.com/

## Supported APIs & Services

* Apple Pay (Pay-ins & Payouts)
* Flow
* Frames (Single)
* Frames (Multiple)
* Hosted Payment Page
* Payment Links
* PayPal / Venmo
* Plaid ACH
* Risk.js
* Webhooks

## Prerequisites

* Git
* Node.js
* NPM

## Installation

Open a terminal and ```cd``` to the app's parent directory, then run:

```
$ git clone https://github.com/jeff94040/cko-test-harness.git
$ cd cko-test-harness/
$ npm install
```

## Configuration

Create the file ```cko-test-harness/.env``` and set the following values:

```
# port to run node app
CKO_PORT=3000

# Mongo DB credentials
MONGO_DB_USER=your_db_user
MONGO_DB_PASSWORD=your_db_password
MONGO_DB_NAME=your_db_name
MONGO_DB_CLUSTER_DOMAIN=cluster0.3.gcos.mongodb.net

# Checkout.com NAS keys
CKO_NAS_SECRET_KEY=sk_sbox_xxx
CKO_NAS_PUBLIC_KEY=pk_sbox_xxx
CKO_NAS_PROCESSING_CHANNEL_ID=pc_xxx
CKO_NAS_CURRENCY_ACCOUNT_ID=ca_xxx
CKO_NAS_WEBHOOK_KEY=xxx...

# Redirect URLs
SUCCESS_URL=""
FAILURE_URL=""

# Plaid credentials
PLAID_CLIENT_ID=...
PLAID_SANDBOX_KEY=...

# Apple Pay
APPLE_PAY_MERCHANT_ID=...
APPLE_PAY_DOMAIN=...
APPLE_PAY_DISPLAY_NAME=...
APPLE_PAY_CERTIFICATE=...
APPLE_PAY_KEY=...

# EEA PC ID for EEA APMs (optional)
CKO_EEA_PROCESSING_CHANNEL_ID
```

## Run the application

```$ node app```

Browse to http://localhost:3000