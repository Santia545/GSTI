import { decodeJWT } from './auth.js';
const jwt = decodeJWT();

window.addEventListener('DOMContentLoaded', () => {
    if (!jwt) {
        return
    }
    const fab = document.createElement('div');
    fab.className = 'fab';
    fab.innerHTML = "&#128722;"
    fab.addEventListener('click', () => {
        window.location.assign("/carrito.html");
    });
    document.body.appendChild(fab);
});

