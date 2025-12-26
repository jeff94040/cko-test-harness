// Table body elem to log events
const eventsTableBody = document.querySelector('#events-table-body')

// Log counter ++ per event fired
var eventCounter = 0;

const publicKey = document.querySelector('#public-key').dataset.publicKey

// Init Frames
Frames.init({
  publicKey: publicKey,
  debug: false,
  schemeChoice: true,
  //modes: [Frames.modes.CVV_HIDDEN]
  //style: {...},
  //namespace: '...',
  //frameSelector: '...',
  [Frames.Events.READY]: () => {
    updateEventsTableBody('Frames.Events.READY',{})
  },
  [Frames.Events.FRAME_ACTIVATED]: () => {
    updateEventsTableBody('Frames.Events.FRAME_ACTIVATED',{})
  },
  [Frames.Events.FRAME_FOCUS]: (event) => {
    updateEventsTableBody('Frames.Events.FRAME_FOCUS', event)
  },
  [Frames.Events.FRAME_BLUR]: (event) => {
    updateEventsTableBody('Frames.Events.FRAME_BLUR', event)
  },
  [Frames.Events.PAYMENT_METHOD_CHANGED]: (event) => {
    updateEventsTableBody('Frames.Events.PAYMENT_METHOD_CHANGED', event)
    if(Frames.isCardValid())
      Frames.submitCard()
  },
  [Frames.Events.CARD_BIN_CHANGED]: (event) => {
    updateEventsTableBody('Frames.Events.CARD_BIN_CHANGED', event)
  },
  [Frames.Events.FRAME_VALIDATION_CHANGED]: (event) => {
    updateEventsTableBody('Frames.Events.FRAME_VALIDATION_CHANGED', event)
  },
  [Frames.Events.CARD_VALIDATION_CHANGED]: (event) => {
    updateEventsTableBody('Frames.Events.CARD_VALIDATION_CHANGED', event)
    //if(Frames.isCardValid())
      Frames.submitCard()    
  },
  [Frames.Events.CARD_SUBMITTED]: (event) => {
    updateEventsTableBody('Frames.Events.CARD_SUBMITTED', event)
  },
  [Frames.Events.CARD_TOKENIZED]: (event) => {
    updateEventsTableBody('Frames.Events.CARD_TOKENIZED', event)
    Frames.enableSubmitForm();
  },
  [Frames.Events.CARD_TOKENIZATION_FAILED]: (event) => {
    updateEventsTableBody('Frames.Events.CARD_TOKENIZATION_FAILED', event)
  }
})

/*
Frames.cardholder = {
  name: 'John Doe',
  billingAddress: {
    addressLine1: '123 Test St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94040',
    country: 'US'
  },
  phone: '5551234567'
}
*/

function updateEventsTableBody(eventName, eventPayload){
  const row = document.createElement('tr')
  row.innerHTML = `<th scope='row'>${++eventCounter}</th><td>${eventName}</td><td>${JSON.stringify(eventPayload)}</td>`
  eventsTableBody.insertBefore(row, eventsTableBody.firstChild)
}