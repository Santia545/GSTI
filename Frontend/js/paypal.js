import { fetchData } from "./requests.js";
import { showSnackbar } from "./snackbar.js";

paypal.Buttons({
    // Call your server to set up the transaction
    createOrder: async function (data, actions) {
        const response = await fetchData('/create-paypal-order', 'POST');
        return response.id;
    },
    onError(error) {
        if (error.message) {
            showSnackbar("Error " + error.message);
        }
        console.log(error);
    },
    onCancel(data) {
        window.location.replace("/carrito.html");
    },
    // Call your server to finalize the transaction
    onApprove: async function (data, actions) {
        const orderData = await fetchData('/comprar', 'POST', { payMethod: 2, idDireccion: localStorage.getItem('idDireccion'), orderID: data.orderID });
        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you
        // This example reads a v2/checkout/orders capture response, propagated from the server
        // You could use a different API or structure for your 'orderData'
        var errorDetail = Array.isArray(orderData.details) && orderData.details[0];
        if (errorDetail && errorDetail.issue === 'INSTRUMENT_DECLINED') {
            return actions.restart(); // Recoverable state, per:

        }
        if (errorDetail) {
            var msg = 'Sorry, your transaction could not be processed.';
            if (errorDetail.description) msg += '\n\n' + errorDetail.description;
            if (orderData.debug_id) msg += ' (' + orderData.debug_id + ')';
            return alert(msg); // Show a failure message (try to avoid alerts in production environments)
        }
        document.getElementById("paypal-button-container").style.visibility = "hidden";
        showSnackbar("Compra realizada con exito, redirigiendo...");
        setTimeout(() => window.location.replace("/products.html"), 2000);
        // Successful capture! For demo purposes:
        /*console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
        var transaction = orderData.purchase_units[0].payments.captures[0];
        alert('Transaction ' + transaction.status + ': ' + transaction.id + '\n\nSee console for all available details');*/
    }

}).render('#paypal-button-container');