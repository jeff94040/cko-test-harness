const payButton = document.querySelector("#pay-button");
const frames_events_div = document.querySelector("#frames-events-div");

// key passed from server
Frames.init(
  {
    publicKey: key,
    debug: true,
    localization: 'EN-GB'
    //style: {...},
    //namespace: '...',
    //frameSelector: '...'
  }
);

populate_frames_events_div(`<br>List all possible events in Frames.Events object: ${JSON.stringify(Frames.Events)}`);

Frames.addEventHandler(Frames.Events.READY, (event) => {
  populate_frames_events_div(`<br>The event 'Frames.Events.READY' fired!<br>`);
});

Frames.addEventHandler(Frames.Events.FRAME_ACTIVATED, (event) => {
  populate_frames_events_div(`<br>The event 'Frames.Events.FRAME_ACTIVATED' fired!<br>`);
});

Frames.addEventHandler(Frames.Events.FRAME_FOCUS, (event) => {
  populate_frames_events_div(`<br>The event 'Frames.Events.FRAME_FOCUS' fired! ${JSON.stringify(event)}<br>`);
});

Frames.addEventHandler(Frames.Events.FRAME_BLUR, (event) => {
  populate_frames_events_div(`<br>The event 'Frames.Events.FRAME_BLUR' fired! ${JSON.stringify(event)}<br>`);
});

Frames.addEventHandler(Frames.Events.FRAME_VALIDATION_CHANGED, (event) => {
  populate_frames_events_div(`<br>The event 'Frames.Events.FRAME_VALIDATION_CHANGED' fired! ${JSON.stringify(event)}<br>`);
});

Frames.addEventHandler(Frames.Events.PAYMENT_METHOD_CHANGED, (event) => {
  populate_frames_events_div(`<br>The event 'Frames.Events.PAYMENT_METHOD_CHANGED' fired! ${JSON.stringify(event)}<br>`);
});

Frames.addEventHandler(Frames.Events.CARD_VALIDATION_CHANGED, (event) => {
    payButton.disabled = !Frames.isCardValid();
    populate_frames_events_div(`<br>The event 'Frames.Events.CARD_VALIDATION_CHANGED' fired! ${JSON.stringify(event)}<br>`);
});

Frames.addEventHandler(Frames.Events.CARD_SUBMITTED, (event) => {
    populate_frames_events_div(`<br>The event 'Frames.Events.CARD_SUBMITTED' fired!<br>`);
});
  
Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, (event) => {
    populate_frames_events_div(`<br>The event 'Frames.Events.CARD_TOKENIZED' fired! <a href='/'>Proceed to use the token via API.</a> ${JSON.stringify(event)}<br>`);
});

Frames.addEventHandler(Frames.Events.CARD_TOKENIZATION_FAILED, (event) => {
  populate_frames_events_div(`<br>The event 'Frames.Events.CARD_TOKENIZATION_FAILED' fired! ${JSON.stringify(event)}<br>`);
});

// Event listener: button click
payButton.addEventListener('click', (event) => {
  payButton.disabled = true;
  event.preventDefault();
  Frames.submitCard();
});

function populate_frames_events_div(log_text){
  frames_events_div.innerHTML = log_text + frames_events_div.innerHTML;
}