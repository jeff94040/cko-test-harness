## Overview

cko-test-harness is a web implementation of the Checkout.com Unified API. It allows users to quickly test and understand the payload-level transaction request and response details. The live web application is available at https://cko.jeff94040.ddns.net/

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
* Node.js v15.12.0 LTS

## Setup

You must configure the following secret and public keys within the user-level environment variables on your server. CKO_HPP_LINKS_* keys are used to authenticate Hosted Payment Page and Payment Links-related services whereas CKO_API_* keys are used to authenticate all remaining APIs. Obtain these credentials from the channels menu of the checkout.com Hub. For example:

* CKO_API_PUBLIC = pk_test_cc6b9135...
* CKO_API_SECRET = sk_test_f1e0c0ae...
* CKO_HPP_LINKS_PUBLIC = pk_test_bf4d6472...
* CKO_HPP_LINKS_SECRET = sk_test_e2d1f4ba...

## Usage

Open a terminal, create and ```cd``` to the application root directory, then run:

```console
$ git clone https://github.com/jeff94040/cko-test-harness.git
$ node app
```