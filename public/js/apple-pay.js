import { faker } from '/vendor/@faker-js/faker/dist/esm/locale/en_US.mjs';

const payInOrPayout = document.querySelector('#pay-in-or-payout')
const applePayMerchantId = document.querySelector('#checkout-or-merchant-decryption');
const applePayUnsupportedDiv = document.querySelector('#apple-pay-unsupported')
const applePayDiv = document.querySelector('#apple-pay')

// Run when the page is fully loaded
document.addEventListener('DOMContentLoaded', checkApplePaySupport);

// Run whenever the dropdown changes
applePayMerchantId.addEventListener('change', checkApplePaySupport);

async function checkApplePaySupport(){

  // Basic check: Is the Apple Pay API even available in this browser?
  if (!window.ApplePaySession) {
    applePayUnsupportedDiv.innerHTML = "Apple Pay not supported."
  }
  else{
    try {
      // Advanced check: Does the device support it AND has a card?
      console.log(`Apple Pay Merchant ID: ${applePayMerchantId.value}`)
      const status = await ApplePaySession.applePayCapabilities(applePayMerchantId.value);
      console.log(`ApplePaySession.applePayCapabilities(): ${status.paymentCredentialStatus}`)

      switch (status.paymentCredentialStatus) {
        
        case 'paymentCredentialsAvailable':
        case 'paymentCredentialsUnavailable':
        case 'paymentCredentialStatusUnknown':
          applePayDiv.removeAttribute('style')
          applePayUnsupportedDiv.innerHTML = ''
          break;

        case 'applePayUnsupported':
        default:
          //applePayDiv.style.display = 'none'
          applePayUnsupportedDiv.innerHTML = "Apple Pay not supported."
      }
    } 
    catch (error) {
      console.error("Error checking Apple Pay capabilities:", error);
    }
  }
}

// when user clicks the apple pay button, we must create/begin an apple pay session, validate the merchant, and submit a payment
document.querySelector('apple-pay-button').addEventListener('click', () => {
  // create session
  console.log('Creating new ApplePaySession()')
  var applePaySession = new ApplePaySession(14, {
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
    countryCode: 'US',
    requiredBillingContactFields: ["postalAddress"],
    requiredShippingContactFields: ["name", "phone", "email"],
    billingContact: {
      givenName: faker.person.fullName(), 
      addressLines: [faker.location.streetAddress()], 
      locality: faker.location.city(), 
      postalCode: faker.location.zipCode(), 
      administrativeArea: faker.location.state(), 
      country: "US"
    },
    shippingContact: {
      givenName: faker.person.fullName(), 
      phoneNumber: faker.phone.number().split(' ')[0],
      emailAddress: faker.internet.email()
    },
    total: {label: "Jeff's Test Account", amount: '3.00'},
    lineItems: [{label: 'Widget A', amount: '1.00'}, {label: 'Widget B', amount: '2.00'}],
    currencyCode: 'USD',
  })
  // begin session
  console.log('Calling applePaySession.begin():')
  applePaySession.begin()

  // validate merchant
  applePaySession.onvalidatemerchant = async (event) => {
    console.log('applePaySession.onValidateMerchant() callback details:', event)
    console.log('Calling /apple-pay-validate-session')
    console.log('applePayMerchantId.value (latest)', applePayMerchantId.value)
    const validateSessionResponse = await (await fetch('/apple-pay-validate-session', {
      method: 'POST',
      body: JSON.stringify({
        validationURL: event.validationURL,
        applePayMerchantId: applePayMerchantId.value
      }),
      headers: {'Content-Type': 'application/json'}
    })).json()
    console.log('Validate session response from server:', validateSessionResponse)
    console.log('Calling completeMerchantValidation()')
    applePaySession.completeMerchantValidation(validateSessionResponse)
  }

  // payment authorized by user
  applePaySession.onpaymentauthorized = async (event) => {
    // submit payment
    console.log('applePaySession.onpaymentauthorized() callback details:', event)

    const url = payInOrPayout.value === 'pay-in' ? '/apple-pay-payment' : '/apple-pay-payout'
    const options = {
      method: 'POST',
      body: JSON.stringify({
        payment: event.payment,
        applePayMerchantId: applePayMerchantId.value
      }),
      headers: {'Content-Type': 'application/json'}
    }

    console.log('Asking server to run the payment...')
    const paymentResponse = await (await fetch(url, options)).json()

    // update session w/ payment results
    document.querySelector('#apple-pay-result').innerHTML = JSON.stringify(paymentResponse, null, 2)
    console.log('Server response from running the payment:', paymentResponse)

    if (paymentResponse.approved === true || paymentResponse.status === 'Pending')
      applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS)
    else
      applePaySession.completePayment(ApplePaySession.STATUS_FAILURE)

  }

})