//const payButton = document.querySelector("#pay-button");
const frames_events_div = document.querySelector("#frames-events-div");
var log_counter = 0;

// key passed from server
Frames.init(
  {
    publicKey: key,
    debug: true,
    localization: 'EN-GB',
    modes: [Frames.modes.CVV_HIDDEN]
    //style: {...},
    //namespace: '...',
    //frameSelector: '...',
    //captureCVV: false -- this option is a suggested enhancement
  }
);

Frames.addEventHandler(Frames.Events.READY, (event) => {
  populate_frames_events_div(`The event 'Frames.Events.READY' fired!`);
});

Frames.addEventHandler(Frames.Events.FRAME_ACTIVATED, (event) => {
  populate_frames_events_div(`The event 'Frames.Events.FRAME_ACTIVATED' fired!`);
});

Frames.addEventHandler(Frames.Events.FRAME_FOCUS, (event) => {
  populate_frames_events_div(`The event 'Frames.Events.FRAME_FOCUS' fired! ${JSON.stringify(event)}`);
});

Frames.addEventHandler(Frames.Events.FRAME_BLUR, (event) => {
  populate_frames_events_div(`The event 'Frames.Events.FRAME_BLUR' fired! ${JSON.stringify(event)}`);
});

Frames.addEventHandler(Frames.Events.FRAME_VALIDATION_CHANGED, (event) => {
  populate_frames_events_div(`The event 'Frames.Events.FRAME_VALIDATION_CHANGED' fired! ${JSON.stringify(event)}`);
});

Frames.addEventHandler(Frames.Events.PAYMENT_METHOD_CHANGED, (event) => {
  populate_frames_events_div(`The event 'Frames.Events.PAYMENT_METHOD_CHANGED' fired! ${JSON.stringify(event)}`);
});

Frames.addEventHandler(Frames.Events.CARD_VALIDATION_CHANGED, (event) => {
    populate_frames_events_div(`The event 'Frames.Events.CARD_VALIDATION_CHANGED' fired! ${JSON.stringify(event)}`);
    if(Frames.isCardValid())
      Frames.submitCard();
});

Frames.addEventHandler(Frames.Events.CARD_SUBMITTED, (event) => {
    populate_frames_events_div(`The event 'Frames.Events.CARD_SUBMITTED' fired!`);
});
  
Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, (event) => {
    populate_frames_events_div(`The event 'Frames.Events.CARD_TOKENIZED' fired! <a href='/'>Proceed to use the token via API.</a> ${JSON.stringify(event)}`);
    Frames.enableSubmitForm();
});

Frames.addEventHandler(Frames.Events.CARD_TOKENIZATION_FAILED, (event) => {
  populate_frames_events_div(`The event 'Frames.Events.CARD_TOKENIZATION_FAILED' fired! ${JSON.stringify(event)}`);
});

// Event listener: button click
/*
payButton.addEventListener('click', (event) => {
  payButton.disabled = true;
  event.preventDefault();
  Frames.submitCard();
});
*/

function populate_frames_events_div(log_text){
  log_counter++;
  frames_events_div.innerHTML = `${log_counter}) ${log_text}<br>${frames_events_div.innerHTML}`;
}