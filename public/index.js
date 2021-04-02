const action = document.querySelector('#action');
const verb = document.querySelector('#verb');
const domain = document.querySelector('#domain');
const path = document.querySelector('#path');
const reqBodyElem = document.querySelector('#request-body');
const resBodyElem = document.querySelector('#response-body');
const resStatusElem = document.querySelector('#response-status');
const button = document.querySelector('button');

action.addEventListener('change', () => {

  if(action.value === 'webhook-notifications'){
    window.location = 'webhook-notifications';
    return;
  }
  if(action.value === 'frames-token'){
    window.location = 'frames';
    return;
  }

  verb.value = data[action.value].verb;
  action.value === '' ? domain.value = '' : domain.value = 'https://api.sandbox.checkout.com';
  path.value = data[action.value].path;
  !data[action.value].body ? reqBodyElem.innerHTML = '' : reqBodyElem.innerHTML = JSON.stringify(data[action.value].body, null, 2);
  resBodyElem.innerHTML = '';
  resStatusElem.innerHTML = '';
});

button.addEventListener('click', async () => {

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({'verb': verb.value, 'domain': domain.value, 'path': path.value, 'body': reqBodyElem.value.length > 0 ? JSON.parse(reqBodyElem.value) : ''})
  }

  try {
    const res = await fetch('/fetch-api-request', options);
    const resJson = await res.json();
    resBodyElem.innerHTML = JSON.stringify(resJson.body, null, 2);
    let link = '';
    if (resJson.body['_links']?.redirect?.href)
      link = ` - <a href=${resJson.body['_links']?.redirect?.href}>Proceed with browser redirect...</a>`;
    resStatusElem.innerHTML = `${resJson.status} - ${resJson.statusText}${link}`; 
    hljs.highlightAll();
  }
  catch (error){
    console.log(error);
  }

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