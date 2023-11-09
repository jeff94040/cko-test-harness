//var createClient = require('braintree-web/client').create;

var createClient = braintree.client.create

createClient({
  authorization: 'sandbox_csfm55wq_ptpg3y82z6fg9bjr'
}, function (createErr, clientInstance) {
  var form = document.getElementById('my-form-id');
  var data = {
    creditCard: {
      number: 4242424242424242,//form['cc-number'].value,
      cvv: 100,//form['cc-cvv'].value,
      expirationDate: '12/2025',//form['cc-expiration-date'].value,
      billingAddress: {
        postalCode: 94040,//form['cc-postal-code'].value
      },
      options: {
        validate: false
      }
    }
  };

  // Warning: For a merchant to be eligible for the easiest level of PCI compliance (SAQ A),
  // payment fields cannot be hosted on your checkout page.
  // For an alternative to the following, use Hosted Fields.
  clientInstance.request({
    endpoint: 'payment_methods/credit_cards',
    method: 'post',
    data: data
  }, function (requestErr, response) {
    // More detailed example of handling API errors: https://codepen.io/braintree/pen/MbwjdM
    if (requestErr) { throw new Error(requestErr); }

    console.log('Got nonce:', response.creditCards[0].nonce);
  });
});