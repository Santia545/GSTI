import { setJWT } from './auth.js';
import { fetchData } from './requests.js';
import { decodeJWT } from './auth.js';
import { showSnackbar } from './snackbar.js';
import { validateEmail, validatePassword } from './validators.js';

document.addEventListener('DOMContentLoaded', async () => {
    const jwt = decodeJWT();
    if (jwt)
        window.location.href = 'index.html';
});
document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const repeatPassword = document.getElementById('cpassword').value;
    if (password != repeatPassword) {
        showSnackbar('Las contraseñas no coinciden');
        return;
    }
    if (password)
        if (!validatePassword(password)) {
            showSnackbar("Error, la contraseña debe contener de 5 a 60 caracteres, incluir al menos 1 letra y numero y solo los siguientes simbolos ._-");
            return;
        }
    if (email)
        if (!validateEmail(email)) {
            showSnackbar("Error formato de email invalido");
            return;
        }
    try {
        await fetchData('/register', 'POST', { username, password, email });
    } catch (e) {
        showSnackbar('Error ' + JSON.parse(e.message).message);
        return;
    }
    window.location.href = 'login.html';
});
