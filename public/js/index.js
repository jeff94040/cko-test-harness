//import { faker } from '/@faker-js/faker/dist/esm/locale/en_US.mjs';
import { faker } from '/vendor/@faker-js/faker/dist/esm/locale/en_US.mjs';

const action = document.querySelector('#action');
const submit_button = document.querySelector('#submit-button');
const submit_button_text = submit_button.querySelector('#submit-button-text');
const submit_button_processing = submit_button.querySelector('#submit-button-processing');
const request_visibility = document.querySelector('#request-visibility');
const request_verb = document.querySelector('#request-verb');
const request_origin = document.querySelector('#request-origin');
const request_path = document.querySelector('#request-path');
const request_body = document.querySelector('#request-body');
const response_visibility = document.querySelector('#response-visibility');
const response_header = document.querySelector('#response-header');
const response_body = document.querySelector('#response-body');
const iframe = document.querySelector('#iframe');
const iframe_div = document.querySelector('#i-frame-hidden-div')
const modal_iframe = document.querySelector('#modal-iframe');

var date = new Date();

const usp = new URLSearchParams(window.location.search);

const data = {
  '': {
    'verb': '',
    'path': '',
  },
  'request-payment': {
    'verb': 'POST',
    'path': '/payments',
    'body': {
      'amount': '1000',
      'billing_descriptor': {
        'name': 'Product Name XYZ',
        'city': 'Mountain View'
      },
      'currency': 'USD',
      'source': {
        'type': 'card',
        'number': '4242424242424242',
        'expiry_month': '12',
        'expiry_year': '2030'
      },
    }
  },
  'request-3ds-payment': {
    'verb': 'POST',
    'path': '/payments',
    'body': {
      'amount': '1000',
      'billing_descriptor': {
        'name': 'Product Name XYZ',
        'city': 'Mountain View'
      },
      'currency': 'USD',
      'source': {
        'type': 'card',
        'number': '4242424242424242',
        'expiry_month': '12',
        'expiry_year': '2030'
      },
      '3ds': {
        'enabled': 'true',
        'attempt_n3d': 'true'
      }
    }
  },
  'request-payout': {
    'verb': 'POST',
    'path': '/payments',
    'body': {
      'destination': {
        'type': 'card',
        'number': '4242424242424242',
        'expiry_month': '12',
        'expiry_year': '2030',
        'first_name': 'John',
        'last_name': 'Doe',
      },
      'processing': {
        'senderInformation': {
          'reference': `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
          'accountNumber': faker.number.int({ min: 1000, max: 100000 }),
          'firstName': 'John',
          'lastName': 'Doe',
          'address': '123 Test St',
          'city': 'New York',
          'state': 'NY',
          'country': 'US',
          'sourceOfFunds': 'Debit'
        }
      },
      'amount': '1000',
      'currency': 'EUR'
    }
  },
  'get-payment-details': {
    'verb': 'GET',
    'path': usp.has('cko-payment-id') ? `/payments/${usp.get('cko-payment-id')}` : (usp.has('cko-session-id') ? `/payments/${usp.get('cko-session-id')}` : '/payments/{id}')
  },
  'get-payment-actions': {
    'verb': 'GET',
    'path': '/payments/{id}/actions'
  },
  'capture-payment': {
    'verb': 'POST',
    'path': '/payments/{id}/captures'
  },
  'refund-payment': {
    'verb': 'POST',
    'path': '/payments/{id}/refunds'
  },
  'void-payment': {
    'verb': 'POST',
    'path': '/payments/{id}/voids'
  },
  'payment-link': {
    'verb': 'POST',
    'path': '/payment-links',
    'body': {
      'amount': 10000,
      'currency': 'USD',
      'billing': {
        'address': {
          'country': 'US'
        }
      },
      'return_url': 'https://cko.jeff94040.ddns.net'
    }
  },
  'hpp-session': {
    'verb': 'POST',
    'path': '/hosted-payments',
    'body': {
      'amount': 10000,
      'currency': 'USD',
      'billing': {
        'address': {
          'country': 'US'
          }
      },
    'success_url': 'https://cko.jeff94040.ddns.net',
    'failure_url': 'https://cko.jeff94040.ddns.net',
    'cancel_url': 'https://cko.jeff94040.ddns.net'      
    }
  },
  'pre-3ds-risk-scan': {
    'verb': 'POST',
    'path': '/risk/assessments/pre-authentication',
    'body': {
      'date': date.toISOString(),
      'source': {
        'type': 'card',
        'number': '4242424242424242',
        'expiry_month': '12',
        'expiry_year': '2030',
        'name': 'John Doe',
        'billing_address': {
          'address_line1': '123 Test St',
          'address_line2': 'Apt 3',
          'city': 'San Francisco',
          'state': 'CA',
          'zip': '94111',
          'country': 'US'
        },
        'phone': {
          'country_code': '1',
          'number': '5551234'
        }
      },
      'customer': {
        'name': 'John Doe',
        'email': 'jdoe@test.com'
      },
      'payment': {
        'psp': 'checkout.com',
        'id': `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`
      },
      'shipping': {
        'address': {
          'address_line1': '123 Test St',
          'address_line2': 'Apt 3',
          'city': 'San Francisco',
          'state': 'CA',
          'zip': '94111',
          'country': 'US'
        }
      },
      'reference': `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
      'description': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore',
      'amount': faker.number.int({ min: 1000, max: 100000 }),
      'currency': 'USD',
      'metadata': {
        'md_1': 'md_1',
        'md_2': 'md_2',
        'md_3': 'md_3',
        'md_4': 'md_4'
      }
    }
  }
}
/*
if (window.addEventListener) {
  window.addEventListener("message", onMessage, false);        
} 
else if (window.attachEvent) {
  window.attachEvent("onmessage", onMessage, false);
}

function onMessage(event) {
  // Check sender origin to be trusted
  if (event.origin !== "http://example.com") return;

  var data = event.data;

  if (typeof(window[data.func]) == "function") {
      window[data.func].call(null, data.message);
  }
}
*/

// Parent window JS (i.e. parent.html)
window.addEventListener('message', (event) => {
  console.log(`Message from iframe: ${event.data}`)
})


// true when window is iframe
if (window.document !== window.parent.document){
  if(usp.has('cko-payment-id')) // HPP
    window.parent.location.href = `?cko-payment-id=${usp.get('cko-payment-id')}`;
  else if(usp.has('cko-session-id')){ // 3DS
    console.log(`window.location.href: ${window.location.href}`) // success or decline url
    window.parent.postMessage('Hello from iframe!'); 
    // Use target origin instead of *
    
    //const foo = ""
    //window.parent.location.href = `?cko-session-id=${usp.get('cko-session-id')}`;
    //parent.confirmRedirectURL(`?cko-session-id=${usp.get('cko-session-id')}`)
  }
    else // PL
    window.parent.location.href = '';
}
else{
  if(usp.has('cko-payment-id') || usp.has('cko-session-id')){
    action.value = 'get-payment-details';
    action_menu_toggled();
  }
}

// add event listener to action dropdown menu
action.addEventListener('change', action_menu_toggled);

function action_menu_toggled(){

  // hide response body when action menu changed
  response_visibility.className = 'visually-hidden';

  // if no action selected, disable submit button & hide request
  if(action.value === 'select-your-action'){
    submit_button.disabled = true;
    request_visibility.className = 'visually-hidden';
  }
  else{
    // enable submit button, populate & display request msg
    submit_button.disabled = false;
    request_visibility.className = 'mb-3';

    request_verb.innerHTML = data[action.value].verb;
    request_path.value = data[action.value].path;
    //!data[action.value].body ? request_body.value = '' : request_body.value = JSON.stringify(data[action.value].body, null, 2);
    if(!data[action.value].body){
      request_body.value = '';
    }
    else{

      var action_body = data[action.value].body;
      action_body.reference = `REF-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`;
      
      //console.log(action_body);

      request_body.value = JSON.stringify(data[action.value].body, null, 2);
    }
  }
}

submit_button.addEventListener('click', async () => {

  // disable button and change contents to processing spinner
  submit_button.disabled = true;
  submit_button_text.className = 'visually-hidden';
  submit_button_processing.removeAttribute('class');

  // build Fetch API options & request
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'verb': request_verb.innerHTML, 
      'domain': request_origin.innerHTML, 
      'path': request_path.value, 
      'body': request_body.value.length > 0 ? JSON.parse(request_body.value) : ''
    })
  }

  try {
    // submit Fetch request
    const fetch_obj = await fetch('/fetch-api-request', options);
    const fetch_response = await fetch_obj.json();
    // populate response details
    response_body.value = JSON.stringify(fetch_response.body, null, 2);
    response_header.innerHTML = `Response Message (${fetch_response.status} - ${fetch_response.statusText})`;
    
    // If _links.redirect.href is returned
    const redirect_href = fetch_response.body['_links']?.redirect?.href;
    if (redirect_href){

      // redirect button
      const redirect_button = document.createElement('button');
      redirect_button.className = 'btn btn-primary btn-sm mt-2';
      redirect_button.type = 'button';
      redirect_button.innerHTML = 'redirect';

      // redirect button event listener
      redirect_button.addEventListener('click', () => {
        window.location.href = redirect_href;
      });

      // iframe button
      const iframe_button = document.createElement('button');
      iframe_button.formTarget = 'iframe';
      iframe_button.className = 'btn btn-primary btn-sm ms-2 mt-2';
      iframe_button.type = 'button';
      iframe_button.innerHTML = 'iframe';

      // iframe button event listener
      iframe_button.addEventListener('click', () => {
        iframe.setAttribute('src', redirect_href);
        iframe.width = '350px';
        iframe.height = '386px';
        iframe.removeAttribute('hidden')
      });

      // modal button
      const modal_button = document.createElement('button');
      modal_button.className = 'btn btn-primary btn-sm ms-2 mt-2';
      modal_button.type = 'button';
      modal_button.innerHTML = 'modal';
      modal_button.setAttribute('data-bs-toggle', 'modal');
      modal_button.setAttribute('data-bs-target', '#exampleModal');

      // modal button event listener
      modal_button.addEventListener('click', () => {
        modal_iframe.setAttribute('src', redirect_href);
        modal_iframe.width = '350px';
        modal_iframe.height = '386px';
      });

      response_visibility.appendChild(redirect_button);
      response_visibility.appendChild(iframe_button);
      response_visibility.appendChild(modal_button); 
    }
  }
  catch (error){
    console.log(error);
  }
  // Make response visible
  response_visibility.removeAttribute('class');

  // Enable button and change contents to Submit
  submit_button.disabled = false;
  submit_button_text.removeAttribute('class');
  submit_button_processing.className = 'visually-hidden';

});