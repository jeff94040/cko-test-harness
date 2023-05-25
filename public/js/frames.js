// Table body elem to log events
const eventsTableBody = document.querySelector('#events-table-body')

// Log counter ++ per event fired
var eventCounter = 0;

// Fetch Frames public key from server

const public_key = await (await fetch('/frames-key')).text()

// Init Frames
Frames.init(
  {
    publicKey: public_key,
    debug: true,
    localization: 'EN-GB',
    schemeChoice: true
    //modes: [Frames.modes.CVV_HIDDEN]
    //style: {...},
    //namespace: '...',
    //frameSelector: '...',
  }
);
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
/*
// console.log(Frames.debugMode) <-- undefined
console.log(Frames.debug)
console.log(Frames.publicKey)
console.log(Frames.namespace)
console.log(Frames.version)
console.log(Frames.cardholder)
console.log(Frames.localization)
console.log(Frames.config)
*/
Frames.addEventHandler(Frames.Events.READY, () => {
  updateEventsTableBody('Frames.Events.READY',{})
});

Frames.addEventHandler(Frames.Events.FRAME_ACTIVATED, () => {
  updateEventsTableBody('Frames.Events.FRAME_ACTIVATED',{})
});

Frames.addEventHandler(Frames.Events.FRAME_FOCUS, (event) => {
  updateEventsTableBody('Frames.Events.FRAME_FOCUS', event)
});

Frames.addEventHandler(Frames.Events.FRAME_BLUR, (event) => {
  updateEventsTableBody('Frames.Events.FRAME_BLUR', event)
});

Frames.addEventHandler(Frames.Events.FRAME_VALIDATION_CHANGED, (event) => {
  updateEventsTableBody('Frames.Events.FRAME_VALIDATION_CHANGED', event)
});

Frames.addEventHandler(Frames.Events.PAYMENT_METHOD_CHANGED, (event) => {
  updateEventsTableBody('Frames.Events.PAYMENT_METHOD_CHANGED', event)
});

Frames.addEventHandler(Frames.Events.CARD_BIN_CHANGED, (event) => {
  updateEventsTableBody('Frames.Events.CARD_BIN_CHANGED', event)
});

Frames.addEventHandler(Frames.Events.CARD_VALIDATION_CHANGED, (event) => {
  updateEventsTableBody('Frames.Events.CARD_VALIDATION_CHANGED', event)
  if(Frames.isCardValid())
    Frames.submitCard();
});

Frames.addEventHandler(Frames.Events.CARD_SUBMITTED, (event) => {
    updateEventsTableBody('Frames.Events.CARD_SUBMITTED', event)
});
  
Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, (event) => {
    updateEventsTableBody('Frames.Events.CARD_TOKENIZED', event)
    Frames.enableSubmitForm();
});

Frames.addEventHandler(Frames.Events.CARD_TOKENIZATION_FAILED, (event) => {
  updateEventsTableBody('Frames.Events.CARD_TOKENIZATION_FAILED', event)
});

function updateEventsTableBody(eventName, eventPayload){
  const row = document.createElement('tr')
  row.innerHTML = `<th scope='row'>${++eventCounter}</th><td>${eventName}</td><td>${JSON.stringify(eventPayload)}</td>`
  eventsTableBody.insertBefore(row, eventsTableBody.firstChild)
}