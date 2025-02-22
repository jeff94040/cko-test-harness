import { faker } from '/@faker-js/faker/dist/esm/locale/en_US.mjs'

const localeDropdown = document.querySelector('#locale-dropdown')
const showPayButtonDropdown = document.querySelector('#show-pay-button-dropdown')
const appearanceInput = document.querySelector('#appearance-input')
const translationsInput = document.querySelector('#translations-input')
const componentOptionsInput = document.querySelector('#component-options-input')
const componentTypeInput = document.querySelector('#component-type-dropdown')
const reqTextArea = document.querySelector('#req-textarea')
const resTextArea = document.querySelector('#res-textarea')
const refreshPaymentComponentsButton = document.querySelector('#mount-pc-button')
const merchantOwnedPayButton = document.querySelector('#merchant-owned-pay-button')
const flowElement = document.querySelector('#flow-element')
const eventsTableBody = document.querySelector('#events-table-body')
const eventsTableHead = document.querySelector('#events-table-head')

var eventCounter = 0
var payments
var public_key = await (await fetch('/frames-key')).text()
const amount = faker.number.int({ min: 1000, max: 100000 })

reqTextArea.value = JSON.stringify({
  amount: amount,
  currency: 'USD',
  reference: `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
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

refreshPaymentComponentsButton.addEventListener('click', () => {
  renderPaymentComponents()
})

merchantOwnedPayButton.addEventListener('click', async () => {
  merchantOwnedPayButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span><span> Submitting Payment...</span>'
  merchantOwnedPayButton.setAttribute('disabled', '')
  payments.submit()
})

async function renderPaymentComponents() {
  eventCounter = 0;

  if(payments !== undefined)
    payments.unmount()

  // clear existing content
  flowElement.innerHTML = ''
  eventsTableBody.innerHTML = ''
  eventsTableHead.innerHTML = ''
  merchantOwnedPayButton.classList.add('invisible')

  try {
    // ask server to create payment session
    const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: reqTextArea.value}
    var paymentSession = await (await fetch('/create-payment-session', options)).json();
    resTextArea.innerHTML = JSON.stringify(paymentSession, null, 2)

    // render payment components if a valid session id is returned from server
    if(paymentSession.id){
      const cko = await CheckoutWebComponents({
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
          if(showPayButtonDropdown.value === 'false')
            merchantOwnedPayButton.classList.remove('invisible')
        },
        onChange: async (_self) => {
          updateEventsTableBody('onChange()', {})
          if(payments.isValid())
            merchantOwnedPayButton.removeAttribute('disabled')
          else
            merchantOwnedPayButton.setAttribute('disabled', '')
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
      payments = cko.create(componentTypeInput.value, {showPayButton: showPayButtonDropdown.value === 'true' ? true : false});

      eventsTableHead.innerHTML = "<tr><th scope='col'>#</th><th scope='col'>Event</th><th scope='col'>isValid()</th><th scope='col'>Payload</th></tr>"

      const isAvailable = await payments.isAvailable()
      
      updateEventsTableBody('isAvailable()', isAvailable)

      if(isAvailable)
        payments.mount(flowElement)
        
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
  row.innerHTML = `<th scope='row'>${++eventCounter}</th><td>${eventName}</td><td>${payments.isValid()}</td><td>${JSON.stringify(eventPayload)}</td>`
  eventsTableBody.insertBefore(row, eventsTableBody.firstChild)
}