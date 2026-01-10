import { faker } from '/vendor/@faker-js/faker/dist/esm/locale/en_US.mjs';

/**
 * UI Element References
 */
const UI = {
  successUrl: document.querySelector('#redirect-urls').dataset.successUrl,
  failureUrl: document.querySelector('#redirect-urls').dataset.failureUrl,
  componentTypeDropdown: document.querySelector('#component-type-dropdown'),
  localeDropdown: document.querySelector('#locale-dropdown'),
  payButtonDropdown: document.querySelector('#pay-button-dropdown'),
  appearanceInput: document.querySelector('#appearance-input'),
  componentOptionsInput: document.querySelector('#component-options-input'),
  translationsInput: document.querySelector('#translations-input'),
  reqTextArea: document.querySelector('#req-textarea'),
  resTextArea: document.querySelector('#res-textarea'),
  refreshFlowButton: document.querySelector('#refresh-flow-button'),
  merchantOwnedPayButton: document.querySelector('#merchant-owned-pay-button'),
  flowElement: document.querySelector('#flow-element'),
  eventsTableBody: document.querySelector('#events-table-body'),
  eventsTableHead: document.querySelector('#events-table-head'),
  processingChannelId: document.querySelector('#pc-id'),
  publicKey: document.querySelector('#pk'),
  secretKey: document.querySelector('#sk')
};

/**
 * Application State
 */
const state = {
  component: null,
  // Automatically calculates count based on existing rows
  get nextEventIndex() {
    return UI.eventsTableBody.rows.length + 1;
  }
};

/**
 * Helpers & Logic
 */

// Safely parse JSON from UI textareas
const safeParse = (str) => {
  try {
    return JSON.parse(str || '{}');
  } catch (e) {
    console.error("JSON Syntax Error:", e);
    return {};
  }
};

// Generate a fresh mock request body
const generateNewPayload = () => {
  const amount = faker.number.int({ min: 1000, max: 100000 });
  return {
    amount: amount,
    currency: 'USD',
    reference: `FLOW-${faker.string.alphanumeric({ length: 5, casing: 'upper' })}`,
    payment_type: 'Regular',
    display_name: 'Jeff US',
    items: [{
      name: "widget", 
      unit_price: amount, // Guaranteed to match parent amount
      quantity: 1
    }],
    billing: { address: { country: 'US' } },
    customer: {
      name: faker.person.fullName(),
      email: faker.internet.email()
    },
    customer_retry: { max_attempts: 5 },
    enabled_payment_methods: ["card", "applepay", "googlepay", "paypal", "plaid"],
    disabled_payment_methods: [],
    success_url: UI.successUrl,
    failure_url: UI.failureUrl,
    payment_method_configuration: {
      card: { store_payment_details: 'collect_consent' }
    },
    capture: true
  };
};

// Log events to the UI table
function logEvent(eventName, eventPayload) {
  const row = document.createElement('tr');
  const isValid = state.component ? state.component.isValid() : false;
  
  row.innerHTML = `
    <th scope='row'>${state.nextEventIndex}</th>
    <td>${eventName}</td>
    <td>${isValid}</td>
    <td><pre style="font-size: 0.75rem; margin:0;">${JSON.stringify(eventPayload, null, 2)}</pre></td>
  `;
  UI.eventsTableBody.insertBefore(row, UI.eventsTableBody.firstChild);
}

/**
 * Core Flow: Render Payment Components
 */
async function renderPaymentComponents() {
  // 1. Lifecycle Cleanup
  if (state.component) {
    state.component.unmount();
    state.component = null;
  }

  // 2. UI Reset
  UI.flowElement.innerHTML = '';
  UI.eventsTableBody.innerHTML = '';
  UI.eventsTableHead.innerHTML = '';
  UI.merchantOwnedPayButton.classList.add('invisible');

  // 3. Logic: UI rules for Tokenization
  const componentTypeSelect = UI.componentTypeDropdown.options[UI.componentTypeDropdown.selectedIndex].text;
  if (componentTypeSelect === 'card (tokenization only)') {
    UI.payButtonDropdown.value = 'false';
    UI.payButtonDropdown.setAttribute('disabled', '');
  } else {
    UI.payButtonDropdown.removeAttribute('disabled');
  }

  try {
    // 4. Create Payment Session
    const sessionResponse = await fetch('/create-payment-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Processing-Channel-Id': UI.processingChannelId.value,
        'Public-Key': UI.publicKey.value,
        'Authorization': UI.secretKey.value
      },
      body: UI.reqTextArea.value
    });

    if (!sessionResponse.ok) throw new Error(`HTTP Error: ${sessionResponse.status}`);

    const paymentSession = await sessionResponse.json();
    UI.resTextArea.value = JSON.stringify(paymentSession, null, 2);

    if (!paymentSession.id) return;

    // 5. Initialize SDK
    const checkout = await CheckoutWebComponents({
      appearance: safeParse(UI.appearanceInput.value),
      componentOptions: safeParse(UI.componentOptionsInput.value),
      environment: 'sandbox',
      locale: UI.localeDropdown.value,
      paymentSession: paymentSession,
      publicKey: UI.publicKey.value,
      translations: safeParse(UI.translationsInput.value),
      
      onReady: () => {
        logEvent('onReady()', {});
        const useMerchantButton = UI.payButtonDropdown.value === 'false' && componentTypeSelect !== 'card (tokenization only)';
        if (useMerchantButton) UI.merchantOwnedPayButton.classList.remove('invisible');
      },
      onChange: async () => {
        logEvent('onChange()', {});
        if (state.component && state.component.isValid()) {
          UI.merchantOwnedPayButton.removeAttribute('disabled');
          if (componentTypeSelect === 'card (tokenization only)') {
            logEvent('tokenizing...', await state.component.tokenize());
          }
        } else {
          UI.merchantOwnedPayButton.setAttribute('disabled', '');
        }
      },
      onPaymentCompleted: (_self, res) => logEvent('onPaymentCompleted()', res),
      onError: (_self, err) => logEvent('onError', err)
    });

    // 6. Create Component Instance
    state.component = checkout.create(UI.componentTypeDropdown.value, {
      showPayButton: UI.payButtonDropdown.value === 'true',
      onTokenized: (self, res) => logEvent('onTokenized()', res),
      onCardBinChanged: (self, res) => logEvent('onCardBinChanged()', res),
      onAuthorized: (self, res) => {
        logEvent('onAuthorized()', res);
        return { continue: true };
      }
    });

    UI.eventsTableHead.innerHTML = "<tr><th>#</th><th>Event</th><th>isValid()</th><th>Payload</th></tr>";

    // 7. Mount
    const isAvailable = await state.component.isAvailable();
    logEvent('isAvailable()', isAvailable);

    if (isAvailable) {
      state.component.mount(UI.flowElement);
    }
    
  } catch (error) {
    console.error('Session Creation Failed:', error);
    UI.resTextArea.value = `Error: ${error.message}`;
  }
}

/**
 * Event Listeners
 */

// Initial Payload Setup
UI.reqTextArea.value = JSON.stringify(generateNewPayload(), null, 2);

UI.refreshFlowButton.addEventListener('click', renderPaymentComponents);

UI.merchantOwnedPayButton.addEventListener('click', async () => {
  if (!state.component) return;
  
  UI.merchantOwnedPayButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';
  UI.merchantOwnedPayButton.setAttribute('disabled', '');
  state.component.submit();
});