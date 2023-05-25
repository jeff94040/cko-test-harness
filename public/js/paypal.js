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
      return response.processing.order_id
    },

    // finalize the transaction
    onApprove: (data, actions) => {
        console.log('order approved')
        /*
        const captureOrderHandler = (details) => {
            const payerName = details.payer.name.given_name;
            console.log('Transaction completed');
        };
        */
        //return actions.order.capture().then(captureOrderHandler);
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
