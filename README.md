## Overview

cko-test-harness is a web implementation of Checkout.com. It allows users to quickly test and understand the payload-level transaction request and response details. The live web application runs at https://cko.jeff94040.ddns.net/

## Supported APIs & Services

* Customers API
* Events API
* Frames
* Hosted Payment Page
* Payment Links
* Payments API
* Sources API
* Token API
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
MONGO_DB_NAME=your_db_name
MONGO_DB_USER=your_db_user
MONGO_DB_PASSWORD=your_db_password

# Checkout.com ABC keys
CKO_ABC_PUBLIC_KEY=pk_test_cc6b9135...
CKO_ABC_SECRET_KEY=sk_test_6879a658...

# Checkout.com NAS keys
CKO_NAS_SECRET_KEY=sk_sbox_rjr7n...
CKO_NAS_PUBLIC_KEY=pk_sbox_wzfdx...
```

## Run the application

```$ node app```

Browse to http://localhost:3000