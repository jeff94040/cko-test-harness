const button = document.querySelector('#button')

button.addEventListener('click', async () => {

  const response = await (await fetch('/create-apm-url', {
    method: 'POST',
    body: JSON.stringify({
      source: {
          type: 'trustly'
      },
      customer: {
        name: "John Doe",
        email: "john.doe@gmail.com",
        phone: {
            country_code: "+33",
            number: "1234567890"
        }
    },
      currency: 'EUR',
      amount: 3000
  }),
    headers: {
      'Content-Type': 'application/json'
    }
  })).json()
  console.log(`create apm url response: ${JSON.stringify(response)}`);
  window.location.replace(response._links.redirect.href)

});