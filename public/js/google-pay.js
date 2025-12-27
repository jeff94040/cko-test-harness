/**
 * CONFIGURATION
 */
// Retrieve key from the meta tag in HTML
const CHECKOUT_PUBLIC_KEY = document.querySelector('#public-key').dataset.publicKey;
const ENVIRONMENT = 'TEST'; 

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
        'gateway': 'checkoutltd',
        'gatewayMerchantId': CHECKOUT_PUBLIC_KEY
    }
};

const cardPaymentMethod = Object.assign(
    {},
    baseCardPaymentMethod,
    { tokenizationSpecification: tokenizationSpecification }
);

let paymentsClient = null;

/**
 * INITIALIZATION
 */
async function initGooglePay() {
    try {
        paymentsClient = new google.payments.api.PaymentsClient({ environment: ENVIRONMENT });

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
    document.getElementById('google-pay-button-container').appendChild(button);
}

/**
 * GOOGLE PAY FLOW
 */
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
        merchantName: 'Your Checkout.com Store'
    };

    try {
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
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

/**
 * CHECKOUT.COM TOKENIZATION
 */
async function handleCheckoutTokenization(googleTokenJson) {
    const tokenData = JSON.parse(googleTokenJson);
    const url = 'https://api.sandbox.checkout.com/tokens';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': CHECKOUT_PUBLIC_KEY
            },
            body: JSON.stringify({
                type: 'googlepay',
                token_data: tokenData
            })
        });

        const data = await response.json();

        if (data.token) {
            console.log("Success! Checkout Token:", data.token);
            alert("Payment Token Created: " + data.token);
            try {
                /* send to backend */
                const response = await fetch('/google-pay-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: data.token
                    })
                });

                // Parse the JSON body from the response
                const paymentResponse = await response.json();

                console.log("Backend Response:", paymentResponse);

                // update session w/ payment results
                document.querySelector('#google-pay-result').innerHTML = JSON.stringify(paymentResponse, null, 2)
                console.log('Server response from running the payment:', paymentResponse)

            } catch (error) {
                console.error("Error sending token to backend:", error);
            }
        } else {
            console.error("Checkout.com Error:", data);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}