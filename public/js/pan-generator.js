const panPrefixInput = document.querySelector('#pan-prefix');
const panLengthInput = document.querySelector('#pan-length');
const numPansInput = document.querySelector('#num-pans');
const generateButton = document.querySelector('#generate-pans-button');
const pansContainer = document.querySelector('#pans-div');

// Luhn Check
const isLuhnValid = (num) => {
    let sum = 0;
    for (let i = 0; i < num.length; i++) {
        let digit = parseInt(num[num.length - 1 - i], 10);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
};

// Helper to generate a single random PAN
function createPan(prefix, totalLength) {
    let pan = prefix;
    while (pan.length < totalLength) {
        pan += Math.floor(Math.random() * 10);
    }
    return pan;
}

function generatePans() {
    const prefix = panPrefixInput.value.trim();
    const length = parseInt(panLengthInput.value, 10);
    const count = parseInt(numPansInput.value, 10);
    
    // Basic validation to prevent infinite loops
    if (!prefix || isNaN(length) || length <= prefix.length) {
        pansContainer.textContent = "Error: Invalid prefix or length.";
        return;
    }

    const results = [];
    let attempts = 0;
    const maxAttempts = count * 100; // Safety break

    // Collect strings in an array
    while (results.length < count && attempts < maxAttempts) {
        const candidate = createPan(prefix, length);
        if (isLuhnValid(candidate)) {
            results.push(candidate);
        }
        attempts++;
    }

    // Bulk DOM update
    pansContainer.innerHTML = results.join('<br>') + (results.length < count ? '<br>...Max attempts reached' : '');
}

generateButton.addEventListener('click', generatePans);