import { faker } from '/@faker-js/faker/dist/esm/locale/en_US.mjs'

const localeDropdown = document.querySelector('#locale-dropdown')
const appearanceInput = document.querySelector('#appearance-input')
const reqTextArea = document.querySelector('#req-textarea')
const resTextArea = document.querySelector('#res-textarea')
const refreshPaymentComponentsButton = document.querySelector('#mount-pc-button')
const paymentsElement = document.querySelector('#payments-element')
const eventsTableBody = document.querySelector('#events-table-body')
const eventsTableHead = document.querySelector('#events-table-head')

var eventCounter = 0
var payments
var public_key = await (await fetch('/frames-key')).text()
  
reqTextArea.value = JSON.stringify({
  amount: faker.number.int({ min: 1000, max: 100000 }),
  currency: 'USD',
  reference: `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
  billing: {
    address: {
      country: 'US'
    }
  },
  customer: {
    name: faker.person.fullName(),
    email: faker.internet.email()
  },
  success_url: 'https://cko.jeff94040.ddns.net',
  failure_url: 'https://cko.jeff94040.ddns.net',
  processing_channel_id: 'pc_i7u3hlih2nze7mq6digv3pemuq'
}, null, 2)

refreshPaymentComponentsButton.addEventListener('click', () => {renderPaymentComponents()})

//renderPaymentComponents()

async function renderPaymentComponents() {
  eventCounter = 0;

  if(payments !== undefined){
    window.Framey = window.Frames
    payments.unmount()
  }

  // clear existing content
  paymentsElement.innerHTML = ''
  eventsTableBody.innerHTML = ''
  eventsTableHead.innerHTML = ''

  try {
    // ask server to create payment session
    const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: reqTextArea.value}
    var paymentSession = await (await fetch('/create-payment-session', options)).json();
    resTextArea.innerHTML = JSON.stringify(paymentSession, null, 2)

    // render payment components if a valid session id is returned from server
    if(paymentSession.id){
      const cko = await CheckoutWebComponents({
        //required configs
        paymentSession,
        publicKey: public_key,
        //optional configs
        environment: 'sandbox',
        // translations: {}
        appearance: JSON.parse(appearanceInput.value),
        locale: localeDropdown.value, // 22 total options
        // javascript callback methods
        onReady: async (_self) => {
          updateEventsTableBody('onReady()', {})
        },
        onChange: async (_self) => {
          updateEventsTableBody('onChange()', {})
        },
        onSubmit: async (_self) => {
          updateEventsTableBody('onSubmit()', {})
        },
        onPaymentCompleted: async (_self, paymentResponse) => {
          updateEventsTableBody('onPaymentCompleted()', paymentResponse)
        },
        onError: async (_self, error) => {
          updateEventsTableBody('onError', error)
        }
      })
      payments = cko.create('payments', {showPayButton: true});
      console.log(`isAvailable(): ${await payments.isAvailable()}`)
      window.Frames = window.Framey
      payments.mount('#payments-element')
      eventsTableHead.innerHTML = "<tr><th scope='col'>#</th><th scope='col'>Event</th><th scope='col'>Payload</th></tr>"  
      // console.log(`isValid(): ${payments.isValid()}`) <- how to call inside callback?
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
  row.innerHTML = `<th scope='row'>${++eventCounter}</th><td>${eventName}</td><td>${JSON.stringify(eventPayload)}</td>`
  eventsTableBody.insertBefore(row, eventsTableBody.firstChild)
}