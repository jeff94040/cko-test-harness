  // build Fetch API options & request
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
       
    })
  }

  try {
    const public_key = await (await fetch('/frames-key')).text()
    const paymentSession = await (await fetch('/create-payment-session', options)).json();
  
    const cko = await CheckoutWebComponents({
      paymentSession,
      environment: 'sandbox',
      publicKey: public_key,
    })
  
    const payments = cko.create('payments');
  
    payments.mount('#payments-element')

  }
  catch(error){
    console.log(error)
  }