    var payButton = document.getElementById("pay-button");

    // Set public key
    Frames.init("pk_test_32c0d57c-2b69-4d68-9cf5-dbcb10809ec5");

    // Event listener: card validation changed
    Frames.addEventHandler(Frames.Events.CARD_VALIDATION_CHANGED, (event) => {
        //console.log("CARD_VALIDATION_CHANGED: %o", event);
        payButton.disabled = !Frames.isCardValid();
      }
    ); 

    // Callback: Card was tokenized
    Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, (event) => {
        var el = document.querySelector(".success-payment-message");
        el.innerHTML = `Card tokenization completed<br>Your card token is: <span class=\"token\">${event.token}</span>`;

        // Jeff's edits -- start
        const a_e = document.createElement('a');
        a_e.href = '/';
        a_e.innerText = 'Proceed to use token via API...'
        document.body.appendChild(a_e);
        // Jeff's edits -- end

      }
    );

    // Event listener: button click
    payButton.addEventListener('click', (event) => {
      payButton.disabled = true;
      event.preventDefault();
      Frames.submitCard();
    });
