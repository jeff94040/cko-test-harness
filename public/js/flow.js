import { faker } from '/@faker-js/faker/dist/esm/locale/en_US.mjs'

const componentTypeDropdown = document.querySelector('#component-type-dropdown')
const localeDropdown = document.querySelector('#locale-dropdown')
const payButtonDropdown = document.querySelector('#pay-button-dropdown')
const appearanceInput = document.querySelector('#appearance-input')
const componentOptionsInput = document.querySelector('#component-options-input')
const translationsInput = document.querySelector('#translations-input')
const reqTextArea = document.querySelector('#req-textarea')
const resTextArea = document.querySelector('#res-textarea')
const refreshFlowButton = document.querySelector('#refresh-flow-button')
const merchantOwnedPayButton = document.querySelector('#merchant-owned-pay-button')
const flowElement = document.querySelector('#flow-element')
const eventsTableBody = document.querySelector('#events-table-body')
const eventsTableHead = document.querySelector('#events-table-head')

var eventCounter = 0
var component
var public_key = await (await fetch('/frames-key')).text()
const amount = faker.number.int({ min: 1000, max: 100000 })

reqTextArea.value = JSON.stringify({
  amount: amount,
  currency: 'USD',
  reference: `FLOW-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
  payment_type: 'Regular',
  items: [{
    name: "widget", unit_price: amount, quantity: 1
  }],
  billing: {
    address: {
      country: 'US'
    }
  },
  customer: {
    name: faker.person.fullName(),
    email: faker.internet.email()
  },
  customer_retry: {
    max_attempts: 5
  },
  enabled_payment_methods: ["card","applepay","googlepay","paypal"],
  disabled_payment_methods: [],
  success_url: 'https://cko.jeff94040.ddns.net/success',
  failure_url: 'https://cko.jeff94040.ddns.net/failure',
  processing_channel_id: 'pc_i7u3hlih2nze7mq6digv3pemuq',
  payment_method_configuration: {
    card: {
      store_payment_details: 'enabled'
    }
  },
  capture: true
}, null, 2)

// Refresh Flow button
refreshFlowButton.addEventListener('click', () => {
  renderPaymentComponents()
})


merchantOwnedPayButton.addEventListener('click', async () => {
  merchantOwnedPayButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span><span> Submitting Payment...</span>'
  merchantOwnedPayButton.setAttribute('disabled', '')
  component.submit()
})

async function renderPaymentComponents() {
  eventCounter = 0;

  if(component !== undefined)
    component.unmount()

  // clear or make invisible existing content
  flowElement.innerHTML = ''
  eventsTableBody.innerHTML = ''
  eventsTableHead.innerHTML = ''
  merchantOwnedPayButton.classList.add('invisible')

  // for tokenization-only, force showPayButton to false
  var componentTypeSelect = componentTypeDropdown.options[componentTypeDropdown.selectedIndex].text
  if(componentTypeSelect == 'card (tokenization only)'){
    payButtonDropdown.value = false
    payButtonDropdown.setAttribute('disabled', '')
  }
  else{
    payButtonDropdown.removeAttribute('disabled')
  }

  try {
    // ask server to create payment session
    const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: reqTextArea.value}
    var paymentSession = await (await fetch('/create-payment-session', options)).json();
    resTextArea.innerHTML = JSON.stringify(paymentSession, null, 2)

    // render payment components if a valid session id is returned from server
    if(paymentSession.id){
      const checkout = await CheckoutWebComponents({
        appearance: JSON.parse(appearanceInput.value),
        componentOptions: JSON.parse(componentOptionsInput.value),
        environment: 'sandbox',
        locale: localeDropdown.value,
        paymentSession: paymentSession, //required
        publicKey: public_key, //required
        translations: JSON.parse(translationsInput.value),
        // javascript callback methods
        onReady: async (_self) => {
          updateEventsTableBody('onReady()', {})
          // show merchant pay button
          if(payButtonDropdown.value === 'false' && componentTypeSelect != 'card (tokenization only)')
            merchantOwnedPayButton.classList.remove('invisible')
        },
        onChange: async (_self) => {
          updateEventsTableBody('onChange()', {})
          if(component.isValid()){
            merchantOwnedPayButton.removeAttribute('disabled')
            if(componentTypeSelect == 'card (tokenization only)')
              updateEventsTableBody('onChange()',  await component.tokenize())
          }
          else {
            merchantOwnedPayButton.setAttribute('disabled', '')
          }
        },
        onSubmit: async (_self) => {
          updateEventsTableBody('onSubmit()', {})
        },
        onPaymentCompleted: async (_self, paymentResponse) => {
          updateEventsTableBody('onPaymentCompleted()', paymentResponse)
          if(!merchantOwnedPayButton.classList.contains('invisible')){
            merchantOwnedPayButton.innerHTML = `<span>Payment ${paymentResponse.status}</span>`
          }
        },
        onError: async (_self, error) => {
          updateEventsTableBody('onError', error)
        }
      })
      component = checkout.create(componentTypeDropdown.value, {showPayButton: payButtonDropdown.value === 'true' ? true : false});

      eventsTableHead.innerHTML = "<tr><th scope='col'>#</th><th scope='col'>Event</th><th scope='col'>isValid()</th><th scope='col'>Payload</th></tr>"

      const isAvailable = await component.isAvailable()
      
      updateEventsTableBody('isAvailable()', isAvailable)

      if(isAvailable)
        component.mount(flowElement)
        
    }
  }
  catch(f){
    console.log('Error creating payment session')
    resTextArea.innerHTML = 'HTTP 400 - Bad Request (Malformed JSON)'
    console.log(f)
  }
}

function updateEventsTableBody(eventName, eventPayload){
  const row = document.createElement('tr')
  row.innerHTML = `<th scope='row'>${++eventCounter}</th><td>${eventName}</td><td>${component.isValid()}</td><td>${JSON.stringify(eventPayload)}</td>`
  eventsTableBody.insertBefore(row, eventsTableBody.firstChild)
}