// declare output div
const UI = {
  deviceSessionIdOutput: document.querySelector('#device-session-id-output'),
  button: document.querySelector('#button'),
  publicKey: document.querySelector('#public-key')
}

// get device session id and populate output div on click
UI.button.addEventListener('click', async () => {

  UI.button.disabled = true

  try{
    const risk = window.Risk.init(UI.publicKey.value)
    const deviceSessionId = await risk.publishRiskData(); // dsid_XXXX
    UI.deviceSessionIdOutput.insertAdjacentHTML('beforeend', `<div>Your device session ID is: <code>${deviceSessionId}</code></div>`); 
    UI.button.disabled = false;
  }
  catch (error){
    console.error(error);
    UI.deviceSessionIdOutput.insertAdjacentHTML('beforeend', `<div>Error: ${error.message || 'Verification failed.'}</div>`);
    UI.button.disabled = false;
  }
}) 