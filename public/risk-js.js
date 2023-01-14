// get default public key from server
const public_key = await (await fetch('/frames-key')).text()
//const public_key = 'blah'

// populate input with default public key
const input_elem = document.querySelector('#public-key')
input_elem.value = public_key

// declare output div
const output_div = document.querySelector('#output')

// get device session id and populate output div on click
document.querySelector('#button').addEventListener('click', async () => {
  const risk = window.Risk.init(input_elem.value)
  const deviceSessionId = await risk.publishRiskData(); // dsid_XXXX
  output_div.innerHTML += `Your device session ID is ${deviceSessionId}<br>`
})