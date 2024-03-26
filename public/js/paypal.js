/* 

merchant-id doesn't appear to be required in the PP JS SDK import
merchant-id, if specified in PP JS SDK import, must align w/ create order, otherwise an error occurs (expected) as both are tied to the seller
merchant-id provided by CKO onboarding, if specified in the PP JS SDK import (&merchant-id=AFEU9UC6LY4FS) following a UPAPI create order, prevents display of Venmo button
merchant-id provided directly by PP, if specified in the PP JS SDK import (&merchant-id=CTM2PE2LRYM8Y), correctly displays Venmo button

*/

var paypalPaymentContext = '';

const paypalButtonsComponent = paypal.Buttons({
    // optional styling for buttons
    // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
    style: {
      color: "gold",
      shape: "pill",
      layout: "vertical"
    },

    // set up the transaction
    createOrder: async (data, actions) => {
      const response = await (await fetch('/create-apm-url', {
        method: 'POST',
        body: JSON.stringify({
            source: {
                type: 'paypal'
            },
            items: [
                {
                    name: 'laptop',
                    unit_price: 2000,
                    quantity: 1
                },
                {
                    name: 'desktop',
                    unit_price: 1000,
                    quantity: 1
                }        
            ],
          currency: 'USD',
          amount: 3000
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })).json()
      console.log(`create apm url response: ${JSON.stringify(response)}`);
      console.log(`response.id: ${response.id}`)
      paypalPaymentContext = response.id
      return response.partner_metadata.order_id
      //return '8J2686759D9826644'
    },

    // finalize the transaction
    onApprove: async (data, actions) => {
      console.log('onApprove().data:')
      console.log(data)
      console.log(`paypalPaymentContext: ${paypalPaymentContext}`)

      const response = await (await fetch('/run-apm-payment', {
        method: 'POST',
        body: JSON.stringify({data, 'paypalPaymentContext': paypalPaymentContext}),
        headers: {
          'Content-Type': 'application/json'            
        }
      })).json()
      
      console.log('/payments response:')
      console.log(response)

      const elem = document.querySelector('#res-textarea')
      elem.innerHTML = JSON.stringify(response, null, 2)
      /*
      const captureOrderHandler = (details) => {
          const payerName = details.payer.name.given_name;
          console.log('Transaction completed');
      };
      
      return actions.order.capture().then(captureOrderHandler);
      */

    },

    // handle unrecoverable errors
    onError: (err) => {
        console.error('An error prevented the buyer from checking out with PayPal');
    }
});

paypalButtonsComponent
    .render("#paypal-button-container")
    .catch((err) => {
        console.error('PayPal Buttons failed to render');
    });
