document.querySelector('#checkbox').addEventListener('click', function() {

  console.log('asking server to call https://sandbox.plaid.com/link/token/create...');

  fetch('/plaid/link-token')
      .then(response => response.json())
      .then(body => {
        console.log(`server successfully returned link_token: ${body['link_token']}...`)
        plaid_create(body['link_token'])
      });

  function plaid_create(plaid_link_token){
    console.log(`calling Plaid.create() JS function with link_token...`)
    const handler = Plaid.create({
      token: plaid_link_token,
      onLoad: () => {},
      onExit: (err, metadata) => {},
      onEvent: (eventName, metadata) => {},
      onSuccess: (public_token, metadata) => {
        console.log(`Plaid library returned public_token: ${public_token}...`)
        console.log(`Plaid library returned metadata: ${metadata}...`)
        console.log('calling onSuccess() function with public_token and metadata...')
        console.log('asking server to invoke sequential calls to:')
        console.log('- https://sandbox.plaid.com/item/public_token/exchange')
        console.log('- https://sandbox.plaid.com/processor/token/create')
        console.log('- https://api.sandbox.checkout.com/payments')
        fetch('/plaid/access-token', {
          method: 'POST',
          body: JSON.stringify({
            public_token: public_token,
            account_id: metadata.accounts[0].id
          }),
          headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(body => {
          console.log(body)
          document.querySelector("#plaid-results-div").innerHTML = JSON.stringify(body, null, 2);
        });
      }
    });
    console.log('calling open() function to spawn Plaid consent window...')
    handler.open();
  }

})

