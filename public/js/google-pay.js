// Constants
const UI = {
    publicKey: document.querySelector('#public-key').dataset.publicKey,
    googlePayButtonContainer: document.querySelector('#google-pay-button-container'),
    googlePayResultContainer: document.querySelector('#google-pay-result'),
}

const gateway = 'checkoutltd'
const merchantName = 'Jeff\'s Test Account'

const baseRequest = { apiVersion: 2, apiVersionMinor: 0 };

const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["AMEX", "DISCOVER", "MASTERCARD", "VISA"]
    }
};

const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        'gateway': gateway,
        'gatewayMerchantId': UI.publicKey
    }
};

const cardPaymentMethod = Object.assign(
    {},
    baseCardPaymentMethod,
    { tokenizationSpecification: tokenizationSpecification }
);

let paymentsClient = null;

// Initialization - triggered by the onload event handler in the HTML script tag
async function initGooglePay() {
    try {
        paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });

        const isReadyToPayRequest = Object.assign({}, baseRequest, {
            allowedPaymentMethods: [baseCardPaymentMethod]
        });

        const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
        
        if (response.result) {
            renderGooglePayButton();
        }
    } catch (err) {
        console.error("Google Pay readiness error:", err);
    }
}

function renderGooglePayButton() {
    const button = paymentsClient.createButton({
        onClick: onGooglePaymentButtonClicked,
        buttonColor: 'black',
        buttonType: 'pay',
        buttonSizeMode: 'fill' // Fills the Bootstrap column width
    });
    UI.googlePayButtonContainer.appendChild(button);
}

// Google Pay Flow
async function onGooglePaymentButtonClicked() {
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.transactionInfo = {
        totalPriceStatus: 'FINAL',
        totalPrice: '10.00',
        currencyCode: 'USD',
        countryCode: 'US'
    };
    paymentDataRequest.merchantInfo = {
        merchantName: merchantName
    };

    try {
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
        console.log('Response from Google Pay SDK: ', paymentData)
        const googleToken = paymentData.paymentMethodData.tokenizationData.token;
        await handleCheckoutTokenization(googleToken);
    } catch (err) {
        if (err.statusCode === 'CANCELED') {
            console.log("User closed the Google Pay selector.");
        } else {
            console.error("loadPaymentData error:", err);
        }
    }
}

// Create Token via Checkout.com
async function handleCheckoutTokenization(googleTokenJson) {
    const tokenData = JSON.parse(googleTokenJson);

    const url = 'https://api.sandbox.checkout.com/tokens'
    const tokenRequest = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': UI.publicKey
        },
        body: JSON.stringify({
            type: 'googlepay',
            token_data: tokenData
        })
    }

    try {

        const rawResponse = await fetch(url, tokenRequest)
        if (!rawResponse.ok) { throw { url: url, status: rawResponse.status, statusText: rawResponse.statusText, details: await rawResponse.text() } }

        const response = await rawResponse.json()
        console.log({url: url, status: rawResponse.status, response: response})

        await handleCheckoutPayment(response.token)

    } catch (error) {
        console.error(error);
    }
}

// Run payment via Checkout.com
async function handleCheckoutPayment(token){
    try {

        const url = '/google-pay-payment'
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token
            })
        }

        const rawResponse = await fetch(url, request)
        if (!rawResponse.ok) { throw { url: url, status: rawResponse.status, statusText: rawResponse.statusText, details: await rawResponse.text() } }

        const response = await rawResponse.json()
        console.log({url: url, status: rawResponse.status, response: response})
        
        UI.googlePayResultContainer.innerHTML = JSON.stringify(response, null, 2)
    } catch (error) {
        console.error(error);
    }
}