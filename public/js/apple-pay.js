import { faker } from '/vendor/@faker-js/faker/dist/esm/locale/en_US.mjs'

const UI = {
  payInOrPayout : document.querySelector('#pay-in-or-payout'),
  applePayMerchantId : document.querySelector('#checkout-or-merchant-decryption'),
  applePayUnsupportedDiv : document.querySelector('#apple-pay-unsupported'),
  applePayDiv : document.querySelector('#apple-pay'),
  applePayButton : document.querySelector('apple-pay-button'),
  applePayPaymentResult : document.querySelector('#apple-pay-payment-result'),
  publicKey : document.querySelector('#public-key').dataset.publicKey
}

// Run when the page is fully loaded
document.addEventListener('DOMContentLoaded', checkApplePaySupport)

// Run whenever the dropdown changes, because the Apple Pay Merchant Id changes
UI.applePayMerchantId.addEventListener('change', checkApplePaySupport)

// Check Support for Apple Pay
async function checkApplePaySupport() {

  if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
    UI.applePayUnsupportedDiv.innerHTML = "Apple Pay is not supported on this device/browser."
    return;
  }
  
  try {
    const status = await ApplePaySession.applePayCapabilities(UI.applePayMerchantId.value)
    console.log('applePayCapabilities(): ', status.paymentCredentialStatus)

    switch (status.paymentCredentialStatus) {
      case 'applePayUnsupported':
        UI.applePayUnsupportedDiv.innerHTML = "Apple Pay not supported."
      default:
        UI.applePayDiv.style.display = 'block'
    }
  } 
  catch (error) {
    console.error("Error checking Apple Pay capabilities: ", error)
  }
}

// when user clicks the apple pay button, we must create/begin an apple pay session, validate the merchant, and submit a payment
UI.applePayButton.addEventListener('click', () => {

  // Prevent double-clicks causing multiple sessions
  UI.applePayButton.style.pointerEvents = 'none'
  UI.applePayButton.style.opacity = '0.5'

  // Determine Apple Pay Version
  const applePayVersion = (() => {
    if (typeof ApplePaySession === 'undefined') return 0;
    for (let v = 18; v > 0; v--) {
      if (ApplePaySession.supportsVersion(v)) return v;
    }
    return 0;
  })();

  const request = {
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
    countryCode: 'US',
    requiredBillingContactFields: ["postalAddress"],
    requiredShippingContactFields: ["name", "phone", "email"],
    billingContact: {
      givenName: faker.person.firstName(), 
      familyName: faker.person.lastName(),
      addressLines: [faker.location.streetAddress()], 
      locality: faker.location.city(), 
      postalCode: faker.location.zipCode(), 
      administrativeArea: faker.location.state(), 
      countryCode: "US"
    },
    shippingContact: {
      phoneNumber: '555' + faker.string.numeric(7),
      emailAddress: faker.internet.email(),
    },
    total: {label: "Jeff's Test Account", amount: '3.00'},
    lineItems: [{label: 'Widget A', amount: '1.00'}, {label: 'Widget B', amount: '2.00'}],
    currencyCode: 'USD',
  }

  // Create Session
  console.log('Calling ApplePaySession()')
  var applePaySession = new ApplePaySession(applePayVersion, request)

  // Begin Session
  console.log('Calling begin()')
  applePaySession.begin()

  // Validate Session
  applePaySession.onvalidatemerchant = async (event) => {

    console.log('Callback onValidateMerchant(): ', event)

    const url = '/apple-pay-validate-session'
    const request = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        validationURL: event.validationURL,
        applePayMerchantId: UI.applePayMerchantId.value
      })
    }
    try{
      const rawValidateSessionResponse = await fetch(url, request)
      if(!rawValidateSessionResponse.ok) throw new Error(`${url} returned an error`)
      const validateSessionResponse = await rawValidateSessionResponse.json()
      console.log('Response from ', url, validateSessionResponse)
      
      console.log('Calling completeMerchantValidation()')
      applePaySession.completeMerchantValidation(validateSessionResponse)

    } catch(error){
      console.error(error)
      applePaySession.abort()
    }
  }

  // session payment authorized by user
  applePaySession.onpaymentauthorized = async (event) => {
    console.log('Callback onpaymentauthorized(): ', event)

    try{
      const token = await handleCheckoutTokenization(event.payment.token.paymentData)
      if (!token) throw new Error("Tokenization failed");

      await handleCheckoutPayment(token, applePaySession, event.payment)
    }
    catch (error){
      console.error(error);
      ApplePaySession.completePayment(ApplePaySession.STATUS_FAILURE);
    }

  }

  applePaySession.oncancel = () => {
    console.log('Callback oncancel()')
    UI.applePayButton.style.pointerEvents = 'all';
    UI.applePayButton.style.opacity = '1';
  }

})

// Create Token via Checkout.com
async function handleCheckoutTokenization(tokenData) {

    const url = 'https://api.sandbox.checkout.com/tokens'
    const request = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': UI.publicKey
      },
      body: JSON.stringify({
          type: 'applepay',
          token_data: tokenData
      })
    }

    try {
        const rawTokenResponse = await fetch(url, request)
        if (!rawTokenResponse.ok) return null
        const tokenResponse = await rawTokenResponse.json()
        console.log('Response from /tokens: ', tokenResponse)

        if (tokenResponse.token) {
            //await handleCheckoutPayment(tokenResponse.token)
            return tokenResponse.token
        } else {
            console.error("Error from /tokens:", tokenResponse);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

// Handle Payment via Checkout.com
async function handleCheckoutPayment(token, applePaySession, payment) {

  console.log('applePaySession: ', applePaySession)

  const url = UI.payInOrPayout.value
  const request = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      token: token,
      applePayMerchantId: UI.applePayMerchantId.value,
      payment: payment
    })
  }

  try {
    const rawPaymentResponse = await fetch(url, request)
    if(!rawPaymentResponse.ok) throw new Error(`${url} returned an error`)
    const paymentResponse = await rawPaymentResponse.json()
    console.log('Response from ', url, paymentResponse)

    // update session w/ payment results
    UI.applePayPaymentResult.innerHTML = JSON.stringify(paymentResponse, null, 2)

    const isSuccess = paymentResponse.approved === true || paymentResponse.status === 'Pending'
    applePaySession.completePayment(isSuccess ? ApplePaySession.STATUS_SUCCESS : ApplePaySession.STATUS_FAILURE);

  } catch(error) {
    console.error(error)
    applePaySession.completePayment(ApplePaySession.STATUS_FAILURE)
  }
}