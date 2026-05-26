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
document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username && !password) {
        showSnackbar("Rellena todos los campos para continuar");
        return;
    }
    if (password)
        if (!validatePassword(password)) {
            showSnackbar('Credenciales invalidas');
            return;
        }
    fetchData('/login', 'GET', { username, password }).then(data => {
        setJWT(data.token);
        window.location.href = 'index.html';
    }).catch(() => {
        showSnackbar('Credenciales invalidas');
    });
});
