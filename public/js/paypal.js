const UI = {
  paypalPaymentResult : document.querySelector('#paypal-payment-result')
}

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
    console.log('Callback createOrder()')

    const url = '/paypal-payment-context'
    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: {
          type: 'paypal'
        },
        items: [
          { name: 'laptop', unit_price: 2000, quantity: 1 },
          { name: 'desktop', unit_price: 1000, quantity: 1 }
        ],
        currency: 'USD',
        amount: 3000
      })
    }

    try{
      const rawResponse = await fetch(url, request)
      if (!rawResponse.ok) {throw new Error(`${url} returned an error`)}
      const response = await rawResponse.json()
      console.log('Response from', url, response)

      paypalPaymentContext = response.id
      return response.partner_metadata.order_id // 8J2686759D9826644
    } catch (error) {
        console.error('createOrder error:', error)
      throw error; // Prevents the PayPal popup from opening on failure
    }
  },

  // finalize the transaction
  onApprove: async (data, actions) => {
    console.log('Callback onApprove()')

    const url = '/paypal-payment'
    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({data, 'paypalPaymentContext': paypalPaymentContext})
    }
    console.log('compare', paypalPaymentContext, ' with ', data.orderID)

    try{
      const rawResponse = await fetch(url, request)
      if (!rawResponse.ok) {throw new Error(`${url} returned an error`)}
      const response = await rawResponse.json()
      console.log('Response from ', url, response)

      UI.paypalPaymentResult.textContent = JSON.stringify(response, null, 2)
    } catch (error) {
        console.error('onApprove error:', error)
    }
  },
  onError: (error) => {
      console.log('Callback onError():', error)
  }
})

paypalButtonsComponent
    .render("#paypal-button-container")
    .catch((error) => {
        console.error('PayPal Buttons failed to render: ', error);
    });
