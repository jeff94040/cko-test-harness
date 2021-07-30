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
const modal_iframe = document.querySelector('#modal-iframe');

const usp = new URLSearchParams(window.location.search);

const data = {
  '': {
    'verb': '',
    'path': '',
  },
  'update-customer-details': {
    'verb': 'PATCH',
    'path': '/customers/{id}',
    'body': {
      'email': 'jdoe@gmail.com',
      'name': 'John Doe'
    }
  },
  'retrieve-event-types': {
    'verb': 'GET',
    'path': '/event-types'
  },
  'retrieve-event': {
    'verb': 'GET',
    'path': '/events/{eventId}'
  },
  'retrieve-event-notification': {
    'verb': 'GET',
    'path': '/events/{eventId}/notifications/{notificationId}'
  },
  'retry-webhook': {
    'verb': 'POST',
    'path': '/events/{eventId}/webhooks/{webhookId}/retry'
  },
  'retry-all-webhooks': {
    'verb': 'POST',
    'path': '/events/{eventId}/webhooks/retry'
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
          'reference': Math.floor(Math.random() * 1000000000),
          'accountNumber': Math.floor(Math.random() * 1000000000),
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
  'create-payment-source': {
    'verb': 'POST',
    'path': '/sources',
    'body': {
      'type': 'ACH',
      'billing_address': {
        'address_line1': '123 Test St',
        'city': 'Mountain View',
        'state': 'CA',
        'zip': 94040,
        'country': 'US'
      },
      'source_data': {
        'account_type': 'Checking',
        'account_number': '1234',
        'routing_number': '12345678',
        'account_holder_name': 'John Doe',
        'billing_descriptor': 'My descriptor'
      }
    }
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
  'retrieve-webhooks': {
    'verb': 'GET',
    'path': '/webhooks',
  },
  'register-webhook': {
    'verb': 'POST',
    'path': '/webhooks',
    'body': {
      'url': 'https://cko.jeff94040.ddns.net/webhook-listener',
      'active': true,
      'headers': {
        'authorization': '1234'
      },
      'content_type': 'json',
      'event_types': [
        'payment_approved',
        'payment_captured'
      ]
    }
  },
  'retrieve-webhook': {
    'verb': 'GET',
    'path': '/webhooks/{id}',
    'body': {
      'url': 'https://example.com/webhooks',
      'active': true,
      'headers': {
        'authorization': '1234'
      },
      'content_type': 'json',
      'event_types': [
        'payment_approved',
        'payment_captured'
      ]
    }
  },
  'update-webhook': {
    'verb': 'PUT',
    'path': '/webhooks/{id}',
    'body': {
      'url': 'https://example.com/webhooks',
      'active': true,
      'headers': {
        'authorization': '1234'
      },
      'content_type': 'json',
      'event_types': [
        'payment_approved',
        'payment_captured'
      ]
    }
  },
  'partially-update-webhook': {
    'verb': 'PATCH',
    'path': '/webhooks/{id}',
    'body': {
      'url': 'https://example.com/webhooks',
      'active': true,
      'headers': {
        'authorization': '1234'
      },
      'content_type': 'json',
      'event_types': [
        'payment_approved',
        'payment_captured'
      ]
    }
  },
  'request-token': {
    'verb': 'POST',
    'path': '/tokens',
    'body': {
      'type': 'card',
      'number': '4242424242424242',
      'expiry_month': '01',
      'expiry_year': '2030'
    },
  },
  'remove-webhook': { 
    'verb': 'DELETE',
    'path': '/webhooks/{id}',
  }
}

// true when window is iframe
if (window.document != window.parent.document){
  if(usp.has('cko-payment-id')) // HPP
    window.parent.location.href = `?cko-payment-id=${usp.get('cko-payment-id')}`;
  else if(usp.has('cko-session-id')) // 3DS
    window.parent.location.href = `?cko-session-id=${usp.get('cko-session-id')}`;
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
    !data[action.value].body ? request_body.value = '' : request_body.value = JSON.stringify(data[action.value].body, null, 2);
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
    hljs.highlightAll();
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

