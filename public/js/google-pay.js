// Constants
const publicKey = document.querySelector('#public-key').dataset.publicKey
const googlePayButtonContainer = document.querySelector('#google-pay-button-container')
const googlePayResultContainer = document.querySelector('#google-pay-result')
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
        'gatewayMerchantId': publicKey
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
    googlePayButtonContainer.appendChild(button);
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

    try {
        const tokenResponse = await (await fetch('https://api.sandbox.checkout.com/tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': publicKey
            },
            body: JSON.stringify({
                type: 'googlepay',
                token_data: tokenData
            })
        })).json();

        console.log('Response from /tokens: ', tokenResponse);

        if (tokenResponse.token) {
            await handleCheckoutPayment(tokenResponse.token)
        } else {
            console.error("Error from /tokens:", tokenResponse);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

// Run payment via Checkout.com
async function handleCheckoutPayment(token){
    try {
        const paymentResponse = await (await fetch('/google-pay-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token
            })
        })).json();
        
        console.log('Response from /google-pay-payment: ', paymentResponse)

        googlePayResultContainer.innerHTML = JSON.stringify(paymentResponse, null, 2)
    } catch (error) {
        console.error("Error sending token to backend:", error);
    }
}