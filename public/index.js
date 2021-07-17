const action = document.querySelector('#action');
const button = document.querySelector('button');
const button_submit_span = button.querySelector('#submit');
const button_processing_span = button.querySelector('#processing');
const request_visibility = document.querySelector('#request-visibility');
const request_verb = document.querySelector('#request-verb');
const request_origin = document.querySelector('#request-origin');
const request_path = document.querySelector('#request-path');
const request_body = document.querySelector('#request-body');
const response_visibility = document.querySelector('#response-visibility');
const response_header_ul = document.querySelector('#response-header-ul');
const response_status_li = document.querySelector('#response-status-li');
const response_body = document.querySelector('#response-body');

action.addEventListener('change', () => {

  response_visibility.className = 'visually-hidden';

  if(action.value === 'select-your-action'){
    button.disabled = true;
    request_visibility.className = 'visually-hidden';
  }
  else if(action.value === 'webhook-notifications'){
    window.location = 'webhook-notifications';
    return;
  }
  else if(action.value === 'frames-token'){
    window.location = 'frames';
    return;
  }
  else{
    button.disabled = false;
    request_visibility.className = 'mb-3';

    request_verb.innerHTML = data[action.value].verb;
    request_path.value = data[action.value].path;
    !data[action.value].body ? request_body.innerHTML = '' : request_body.innerHTML = JSON.stringify(data[action.value].body, null, 2);
  }

});

button.addEventListener('click', async () => {

  // disable button and change contents to processing spinner
  button.disabled = true;
  button_submit_span.className = 'visually-hidden';
  button_processing_span.removeAttribute('class');

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
    const fetch_obj = await fetch('/fetch-api-request', options);
    const fetch_response = await fetch_obj.json();
    response_body.innerHTML = JSON.stringify(fetch_response.body, null, 2);
    response_status_li.innerHTML = `${fetch_response.status} ${fetch_response.statusText}`;
    response_status_li.className = `list-group-item list-group-item-${fetch_response.status < 300 ? 'success' : 'danger'}`;
    
    document.querySelector('#response-redirect-li')?.remove();

    // If redirect href is returned
    const redirect_href = fetch_response.body['_links']?.redirect?.href;
    if (redirect_href){
      const a = document.createElement('a');
      a.href = redirect_href;
      a.className = 'link-primary';
      a.innerHTML = 'Proceed with browser redirect';

      const li = document.createElement('li');
      li.className = 'list-group-item list-group-item-secondary';
      li.id = 'response-redirect-li'
      li.appendChild(a);

      response_header_ul.appendChild(li);

    }
    hljs.highlightAll();
  }
  catch (error){
    console.log(error);
  }
  // Make response visible
  response_visibility.removeAttribute('class');

  // Enable button and change contents to Submit
  button.disabled = false;
  button_submit_span.removeAttribute('class');
  button_processing_span.className = 'visually-hidden';

});

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
        'type': 'token',
        'token': ''
      }
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
    'path': '/payments/{id}'
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
      }
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
    'success_url': 'https://cko.jeff94040.ddns.net/hpp-result/success',
    'failure_url': 'https://cko.jeff94040.ddns.net/hpp-result/failure',
    'cancel_url': 'https://cko.jeff94040.ddns.net/hpp-result/cancel'      
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