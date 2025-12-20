//import { faker } from '/@faker-js/faker/dist/esm/locale/en_US.mjs'
import { faker } from '/vendor/@faker-js/faker/dist/esm/locale/en_US.mjs';


const payInOrPayout = document.querySelector('#pay-in-or-payout')

// determine level of device, browser, and wallet support for Apple Pay and display the appropriate results
if (!window.ApplePaySession) {
  document.querySelector('#apple-pay-availability').innerHTML = 'This browser does not support Apple Pay. Try Safari on any device or Chrome on iOS.'
}
else if(!ApplePaySession.canMakePayments){
  document.querySelector('#apple-pay-availability').innerHTML = 'This browser supports Apple Pay, but the device is not capable of making Apple Pay payments.'
}
else{
  const applePayMerchantID = await (await fetch('/apple-pay-merchant-id')).text()

  const activeCard = await ApplePaySession.canMakePaymentsWithActiveCard(applePayMerchantID);

  if(activeCard)
    document.querySelector('#apple-pay-button').removeAttribute('style')
  else
    document.querySelector('#apple-pay-availability').innerHTML = 'This device and browser both support Apple Pay. Either your wallet does not have an eligible payment method or wallet access is prevented by use of an external monitor.'
}

// when user clicks the apple pay button, we must create/begin an apple pay session, validate the merchant, and submit a payment
document.querySelector('apple-pay-button').addEventListener('click', () => {
  // create session
  console.log('Creating ApplePaySession()')
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
      phoneNumber: faker.phone.number('4##-###-####'),
      emailAddress: faker.internet.email()
    },
    total: {label: "Jeff's Test Account", amount: '3.00'},
    lineItems: [{label: 'Widget A', amount: '1.00'}, {label: 'Widget B', amount: '2.00'}],
    currencyCode: 'USD',
  })
  // begin session
  console.log('Calling ApplePaySession.begin():')
  applePaySession.begin()

  // validate merchant
  applePaySession.onvalidatemerchant = async (event) => {
    console.log('ApplePaySession.onValidateMerchant() callback details:')
    console.log(event)
    console.log('Asking server to validate the session...')
    const validateSessionResponse = await (await fetch('/apple-pay-validate-session', {
      method: 'POST',
      body: JSON.stringify({
        validationURL: event.validationURL
      }),
      headers: {'Content-Type': 'application/json'}
    })).json()
    console.log('Validate session response from server:')
    console.log(validateSessionResponse)
    console.log('Calling completeMerchantValidation():')
    var foo = applePaySession.completeMerchantValidation(validateSessionResponse)
    console.log('foo:')
    console.log(foo)
  }

  // payment authorized by user
  applePaySession.onpaymentauthorized = async (event) => {
    // submit payment
    console.log('ApplePaySession.onpaymentauthorized() callback details:')
    console.log(event)

    const url = payInOrPayout.value === 'pay-in' ? '/apple-pay-payment' : '/apple-pay-payout'
    const options = {
      method: 'POST',
      body: JSON.stringify({
        payment: event.payment
      }),
      headers: {'Content-Type': 'application/json'}
    }

    console.log('Asking server to run the payment...')
    const paymentResponse = await (await fetch(url, options)).json()

    // update session w/ payment results
    document.querySelector('#apple-pay-result').innerHTML = JSON.stringify(paymentResponse, null, 2)
    console.log('Server response from running the payment:')
    console.log(paymentResponse)

    if (paymentResponse.approved === true || paymentResponse.status === 'Pending')
      applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS)
    else
      applePaySession.completePayment(ApplePaySession.STATUS_FAILURE)

    //applePaySession.completePayment(paymentResponse.approved === true ? ApplePaySession.STATUS_SUCCESS : ApplePaySession.STATUS_FAILURE)
  }

})