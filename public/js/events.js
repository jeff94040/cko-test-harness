const events = await (await fetch('/fetch-events')).json()

const accordion = document.createElement('div');
accordion.className = 'container accordion';
accordion.id = 'accordionExample';
document.body.appendChild(accordion);

events.forEach(element => {
  const code_elem = document.createElement('code');
  code_elem.innerText = JSON.stringify(element.any, null, 2);
  const pre_elem = document.createElement('pre');
  pre_elem.appendChild(code_elem);

  const accordion_item = document.createElement('div');
  accordion_item.className = 'accordion-item';
  
  const h2 = document.createElement('h2');
  h2.className = 'accordion-header';
  h2.id = `heading${element._id}`;

  const button = document.createElement('button');
  button.className = 'accordion-button collapsed';
  button.type = 'button';
  button.setAttribute('data-bs-toggle', 'collapse');
  button.setAttribute('data-bs-target', `#collapse${element._id}`);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `collapse${element._id}`);
  button.innerHTML = `${element.any.body.type} - ${time_ago(element.any.body.created_on)}`;

  const collapse_div = document.createElement('div');
  collapse_div.id = `collapse${element._id}`;
  collapse_div.className = 'accordion-collapse collapse';
  collapse_div.setAttribute('aria-labelledby',`heading${element._id}`);
  collapse_div.setAttribute('data-bs-parent', '#accordionExample');

  const body_div = document.createElement('div');
  body_div.className = 'accordion-body';
  body_div.appendChild(pre_elem);

  collapse_div.appendChild(body_div);

  h2.appendChild(button);

  accordion_item.appendChild(h2);
  accordion_item.appendChild(collapse_div);

  accordion.appendChild(accordion_item);

});

// calculates time ago & returns readable string, twitter style
function time_ago(event_time){

  const secs_elapsed = (Date.now() - Date.parse(event_time)) / 1000;
  var time_elapsed;

  if(secs_elapsed < 60){ // less than 1 minute
    time_elapsed = `${Math.trunc(secs_elapsed)} seconds ago`;
  }
  else if (secs_elapsed < 3600){ // less than 1 hour
    time_elapsed = `${Math.trunc(secs_elapsed / 60)} minutes ago`;
  }
  else if (secs_elapsed < 86400){ // less than 1 day
    time_elapsed = `${Math.trunc(secs_elapsed / 3600)} hours ago`;
  }
  else{
    time_elapsed = `${Math.trunc(secs_elapsed / 86400)} days ago`;
  }

  return time_elapsed;

}