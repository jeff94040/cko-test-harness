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
      // fetch paypal order id from server and return it here
      const createOrderResponse = await (await fetch('/paypal-create-order')).json()
      console.log(`create order response: ${JSON.stringify(createOrderResponse)}`)
      return createOrderResponse.processing.order_id
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
