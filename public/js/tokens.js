document.getElementById('payment-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const responseDiv = document.getElementById('response');
    
    // 1. Gather data from the form
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, ''); // Remove spaces
    const cvv = document.getElementById('cvv').value;
    const expiryMonth = document.getElementById('expiryMonth').value;
    const expiryYear = document.getElementById('expiryYear').value;

    // 2. Configuration
    // 'pk_sbox_xxx';
    const publicKey =   document.querySelector('#public-key').dataset.publicKey

    const url = 'https://api.sandbox.checkout.com/tokens';

    // 3. Construct the payload
    const payload = {
        type: "card",
        number: cardNumber,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        cvv: cvv
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";
    responseDiv.textContent = "";

    try {
        // 4. Send the POST request
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // 5. Display the result
        if (response.ok) {
            responseDiv.style.color = 'green';
            responseDiv.textContent = 'Success! Token created:\n' + JSON.stringify(data, null, 2);
            console.log("Token ID:", data.token);
        } else {
            responseDiv.style.color = 'red';
            responseDiv.textContent = 'Error:\n' + JSON.stringify(data, null, 2);
        }

    } catch (error) {
        responseDiv.style.color = 'red';
        responseDiv.textContent = 'Network Error: ' + error.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Tokenize Card";
    }
});