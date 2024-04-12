console.log('asking server to call https://sandbox.plaid.com/link/token/create...');

fetch('/plaid/link-token')
    .then(response => response.json())
    .then(body => {
      console.log(`server successfully returned link_token: ${body['link_token']}...`)
      document.querySelector('#plaid-link-token').value = body['link_token'];
    });

document.querySelector('#ach-submit-button').addEventListener('click', () => {

  if(!document.querySelector('#ach-authorization-checkbox').checked)
    return;

  const handler = Plaid.create({
    token: document.querySelector('#plaid-link-token').value,
    onLoad: () => {},
    onExit: (err, metadata) => {},
    onEvent: (eventName, metadata) => {},
    onSuccess: (public_token, metadata) => {
      console.log('Plaid onSuccess() callback fired...')
      console.log(`Plaid library returned public_token: ${public_token}`)
      console.log(`Plaid library returned account_id: ${metadata.accounts[0].id}`)
      console.log('Plaid library returned metadata object:')
      console.log(metadata)
      console.log('asking server to invoke sequential calls to:')
      console.log('- https://sandbox.plaid.com/item/public_token/exchange')
      console.log('- https://sandbox.plaid.com/processor/token/create')
      console.log('- https://api.sandbox.checkout.com/payments')
      document.querySelector('#spinner').className='spinner-border d-inline-block';
      fetch('/plaid/access-token', {
        method: 'POST',
        body: JSON.stringify({
          public_token: public_token,
          account_id: metadata.accounts[0].id,
          amount: document.querySelector('#amount').value
        }),
        headers: {'Content-Type': 'application/json'}
      })
      .then(response => response.json())
      .then(body => {
        console.log(body)
        document.querySelector('#spinner').className='spinner-border d-none';
        document.querySelector("#plaid-results-div").innerHTML = JSON.stringify(body, null, 2);
        var toastElList = [].slice.call(document.querySelectorAll('.toast'))
        var toastList = toastElList.map(function(toastEl) {
          return new bootstrap.Toast(toastEl)
        })
        toastList.forEach(toast => toast.show())        
      });
    }
  });
  
  console.log('spawning Plaid modal via open() function...')
  handler.open();

})