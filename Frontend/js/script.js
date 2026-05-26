import { checkJWT, removeJWT } from './auth.js';

function toggleMenu() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('active');
}
document.addEventListener('DOMContentLoaded', () => {
    fetch('/templates/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
            document.querySelector('.hamburger').addEventListener('click', toggleMenu);
            checkJWT();
            document.getElementById('logout-button').addEventListener('click', () => {
                removeJWT();
                window.location.href = 'index.html';
            });
        });

    fetch('./templates/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
});


