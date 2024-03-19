/***
 * BT Code to Generate Nonce
 */

const braintreeClientId = 'sandbox_rzp8y9v6_p6xg7ktdzjg6gtfm'
var createClient = braintree.client.create

createClient({
  authorization: braintreeClientId
}, function (createErr, clientInstance) {
  var form = document.getElementById('my-form-id');
  var data = {
    creditCard: {
      number: 4111111111111111,//form['cc-number'].value,
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

/***
 * BT Code for Hosted Fields
 */

var form = document.querySelector('#my-sample-form');
var submit = document.querySelector('input[type="submit"]');

braintree.client.create({
  authorization: braintreeClientId
}, function (clientErr, clientInstance) {
  if (clientErr) {
    console.error(clientErr);
    return;
  }

  // This example shows Hosted Fields, but you can also use this
  // client instance to create additional components here, such as
  // PayPal or Data Collector.

  braintree.hostedFields.create({
    client: clientInstance,
    styles: {
      'input': {
        'font-size': '14px'
      },
      'input.invalid': {
        'color': 'red'
      },
      'input.valid': {
        'color': 'green'
      }
    },
    fields: {
      number: {
        container: '#card-number',
        placeholder: '4111 1111 1111 1111'
      },
      cvv: {
        container: '#cvv',
        placeholder: '123'
      },
      expirationDate: {
        container: '#expiration-date',
        placeholder: '10/2022'
      }
    }
  }, function (hostedFieldsErr, hostedFieldsInstance) {
    if (hostedFieldsErr) {
      console.error(hostedFieldsErr);
      return;
    }

    submit.removeAttribute('disabled');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
        if (tokenizeErr) {
          console.error(tokenizeErr);
          return;
        }

        // If this was a real integration, this is where you would
        // send the nonce to your server.
        console.log('Got a nonce from Hosted Fields: ' + payload.nonce);
      });
    }, false);
  });
});