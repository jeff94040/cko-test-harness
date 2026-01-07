const UI = {
  paypalPaymentResult : document.querySelector('#paypal-payment-result')
}

var contextID = '';
var orderID = '';

const paypalButtonsComponent = paypal.Buttons({
  style: {
    color: "gold",
    shape: "pill",
    layout: "vertical"
  },

  createOrder: async (data, actions) => {
    console.log('Callback createOrder()');

    const url = '/paypal-payment-context';
    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: { type: 'paypal' },
        items: [
          { name: 'laptop', unit_price: 2000, quantity: 1 },
          { name: 'desktop', unit_price: 1000, quantity: 1 }
        ],
        currency: 'USD',
        amount: 3000
      })
    }

    try{
      const rawResponse = await fetch(url, request);
      if (!rawResponse.ok) { throw { url: url, status: rawResponse.status, statusText: rawResponse.statusText, details: await rawResponse.text() } }

      const response = await rawResponse.json()
      console.log({url: url, status: rawResponse.status, response: response})

      contextID = response.id;
      orderID = response.partner_metadata.order_id;

      return orderID
      
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  onApprove: async (data, actions) => {
    console.log('Callback onApprove()');
    const url = '/paypal-payment';
    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, 'contextID': contextID })
    }

    try {
      const rawResponse = await fetch(url, request);
      if (!rawResponse.ok) { throw { url: url, status: rawResponse.status, statusText: rawResponse.statusText, details: await rawResponse.text() } }

      const response = await rawResponse.json();
      console.log({url: url, status: rawResponse.status, response: response})

      UI.paypalPaymentResult.textContent = JSON.stringify(response, null, 2);
    } catch (error) {
      console.error(error);
      throw error
    }
  },

  onError: (error) => {
    console.log('Callback onError():', error);
  }
});

paypalButtonsComponent.render("#paypal-button-container");