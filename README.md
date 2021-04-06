## Overview

cko-test-harness is a web implementation of the Checkout.com Unified API. It allows users to quickly test and understand the payload-level transaction request and response details. The live web application is available [here]: https://cko.jeff94040.ddns.net/

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

* Node.js v15.12.0 LTS

## Setup

You must configure the following secret and public keys within the user (not system) environment variables on your server. The CKO_HPP_LINKS_* keys are used to authenticate Hosted Payment Page and Payment Links-related services whereas the CKO_API_* are used to authenticate all remaining APIs. Obtain these credentials from the channels menu of the checkout.com Hub. 

* CKO_API_PUBLIC
* CKO_API_SECRET
* CKO_HPP_LINKS_PUBLIC
* CKO_HPP_LINKS_SECRET

## Usage

Open a terminal and cd to the application root directory then run:

```console
$ node app
```console