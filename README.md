## Overview

cko-test-harness is a web implementation of Checkout.com. It allows users to quickly test and understand the payload-level transaction request and response details. The live web application runs at https://cko.jeff94040.ddns.net/

## Supported APIs & Services

* Apple Pay
* PayPal
* Plaid ACH
* Frames
* Hosted Payment Page
* Payment Links
* Webhooks
* Customers API
* Events API
* Payments API
* Sources API
* Token API

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

# Checkout.com ABC keys
CKO_ABC_PUBLIC_KEY=pk_test_xxx
CKO_ABC_SECRET_KEY=sk_test_xxx

# Checkout.com NAS keys
CKO_NAS_SECRET_KEY=sk_sbox_xxx
CKO_NAS_PUBLIC_KEY=pk_sbox_xxx
CKO_NAS_PROCESSING_CHANNEL_ID=pc_xxx
CKO_NAS_WEBHOOK_KEY=xxx...

# Plaid credentials
PLAID_CLIENT_ID=...
PLAID_SANDBOX_KEY=...

# Apple Pay
APPLE_PAY_MERCHANT_ID=...
APPLE_PAY_DOMAIN=...
APPLE_PAY_DISPLAY_NAME=...
APPLE_PAY_CERTIFICATE=...
APPLE_PAY_KEY=...
```

## Run the application

```$ node app```

Browse to http://localhost:3000