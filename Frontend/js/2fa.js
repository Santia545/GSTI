import { setJWT } from './auth.js';
import { fetchData } from './requests.js';
import { decodeJWT } from './auth.js';
import { showSnackbar } from './snackbar.js';
import { validatePassword } from './validators.js';

document.addEventListener('DOMContentLoaded', async () => {
    const jwt = decodeJWT();
    if (jwt)
        window.location.href = 'index.html';
});
document.getElementById('2FA-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const code = document.getElementById('2fa').value;
    console.log(code);
    if (!code) {
        showSnackbar("Rellena todos los campos para continuar");
        return;
    }
    fetchData('/verify-2fa', 'POST', {username: sessionStorage.getItem('username'), code }).then(data => {
        setJWT(data.token);
        sessionStorage.removeItem('username');
        window.location.href = 'index.html';
    }).catch((error) => {
        if (error.message) {
            if(JSON.parse(error.message).message == "Code expired") {
                showSnackbar('El codigo ha expirado');
                return;
            }
        }
        showSnackbar('Codigo invalido');
    });
});
