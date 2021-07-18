fetch_webhooks();

async function fetch_webhooks() {

  const options = {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'filter': {}
    })
  }

  try {
    const fetch_obj = await fetch('/fetch-webhooks', options);
    const fetch_response = await fetch_obj.json();

    // console.log(fetch_response);

    fetch_response.forEach(element => {
      const code_elem = document.createElement('code');
      code_elem.innerText = JSON.stringify(element, null, 2);;
      const pre_elem = document.createElement('pre');
      pre_elem.appendChild(code_elem);
      document.body.appendChild(pre_elem);       
    });

    hljs.highlightAll();
  }
  catch (error){
    console.log(error);
  }
}