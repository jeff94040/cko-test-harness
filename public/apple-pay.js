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
  var applePaySession = new ApplePaySession(14, {
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
    countryCode: 'US',
    total: {label: "Jeff's Test Account", amount: '3.00'},
    lineItems: [{label: 'Widget A', amount: '1.00'}, {label: 'Widget B', amount: '2.00'}],
    currencyCode: 'USD',
  })
  // begin session
  applePaySession.begin()

  // validate merchant
  applePaySession.onvalidatemerchant = async (event) => {
    const validateSessionResponse = await (await fetch('/apple-pay-validate-session', {
      method: 'POST',
      body: JSON.stringify({
        validationURL: event.validationURL
      }),
      headers: {'Content-Type': 'application/json'}
    })).json()
    applePaySession.completeMerchantValidation(validateSessionResponse)
  }

  // payment authorized by user
  applePaySession.onpaymentauthorized = async (event) => {
    // submit payment
    const paymentResponse = await (await fetch('/apple-pay-payment', {
      method: 'POST',
      body: JSON.stringify({
        token: event.payment.token
      }),
      headers: {'Content-Type': 'application/json'}
    })).json()

    // update session w/ payment results
    document.querySelector('#apple-pay-result').innerHTML = JSON.stringify(paymentResponse, null, 2)

    applePaySession.completePayment(paymentResponse.approved === true ? ApplePaySession.STATUS_SUCCESS : ApplePaySession.STATUS_FAILURE)
  }

})
