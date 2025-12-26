// declare output div
const outputDiv = document.querySelector('#output')
const button = document.querySelector('#button')
const publicKey = document.querySelector('#public-key')

// get device session id and populate output div on click
button.addEventListener('click', async () => {

  button.disabled = true

  try{
    const risk = window.Risk.init(publicKey.value)
    const deviceSessionId = await risk.publishRiskData(); // dsid_XXXX
    outputDiv.insertAdjacentHTML('beforeend', `<div>Your device session ID is: <code>${deviceSessionId}</code></div>`); button.disabled = false;
  }
  catch (err){
    console.error("Risk SDK Error:", err);
    outputDiv.insertAdjacentHTML('beforeend', `<div>Error: ${err.message || 'Verification failed.'}</div>`);
    button.disabled = false;  }
}) 