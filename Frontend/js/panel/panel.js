import { decodeJWT } from '../auth.js';
import { getUsers, registerAdmin } from './panelUsuarios.js';
import { getProducts, insertProduct } from './panelProductos.js';
import { getVentas } from './panelVentas.js';
import { getBitacoras } from './panelHistorial.js';
import { showModal } from '../modal.js';
import { showSnackbar } from '../snackbar.js';
import { getDirecciones, insertDireccion } from './panelDirecciones.js';
import { fetchData } from '../requests.js';
import { validateEmail, validatePassword } from '../validators.js';

let currentPage = 1;
let limit = 5;
let order = 'ASC';
let getFunction = getUsers;
document.addEventListener('DOMContentLoaded', () => {
    const jwt = decodeJWT();
    if (!jwt) {
        window.location.href = 'login.html';
    }
    const title = document.getElementById('username-h1');
    if (jwt.Role != '2') {
        title.textContent += 'Administrador: ';
        fetch('templates/adminpanel.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('panel-placeholder').innerHTML = data;
                getFunction = () => { getUsers(currentPage, limit, order) };
                getFunction();
                const usersButton = document.getElementById('users-button');
                const addUsersButton = document.getElementById('add-user-button');
                const paginationControls = document.querySelector('.pagination-controls')
                addUsersButton.addEventListener('click', async () => {
                    const modalBody = await fetch('templates/panel/user.html').then(response => response.text());
                    showModal('Agregar Usuario', modalBody,
                        async () => {
                            const username = document.getElementById('username').value;
                            const role = document.getElementById('role').value;
                            const email = document.getElementById('email').value;
                            const password = document.getElementById('password').value;
                            if (!username || !role || !email) {
                                showSnackbar('Por favor llena todos los campos');
                                throw new Error();
                            }
                            if (username.length > 40) {
                                showSnackbar("Error, el nombre de usuario no puede ser mayor a 40 caracteres");
                                throw new Error();
                            }
                            if (password)
                                if (!validatePassword(password)) {
                                    showSnackbar("Error, la contraseña debe contener de 5 a 60 caracteres, incluir al menos 1 letra y numero y solo los siguientes simbolos ._-");
                                    throw new Error();
                                }
                            if (email)
                                if (!validateEmail(email)) {
                                    showSnackbar("Error formato de email invalido");
                                    throw new Error();
                                }
                            const body = { username, role, email, password };
                            await registerAdmin(body);
                            getUsers(currentPage, limit, order);
                        }, () => { }, 'Agregar Usuario', { closeOnFailure: false });
                });
                const addProductsButton = document.getElementById('add-product-button');
                addProductsButton.addEventListener('click', async () => {
                    const modalBody = await fetch('templates/panel/product.html').then(response => response.text());
                    showModal('Agregar Producto', modalBody,
                        async () => {
                            const sku = document.getElementById('sku').value;
                            const nombre = document.getElementById('nombre').value;
                            const precio = document.getElementById('precio').value;
                            const descripcion = document.getElementById('descripcion').value;
                            const cantidad = document.getElementById('cantidad').value;
                            const base64Image = document.querySelector('img').src;
                            if (!sku || !nombre || !precio || !descripcion || !cantidad || !base64Image) {
                                showSnackbar('Por favor llena todos los campos');
                                throw new Error();
                            }
                            if (sku.length > 100) {
                                showSnackbar("Error, el sku no puede ser mayor a 100 caracteres");
                                throw new Error();
                            }
                            if (nombre.length > 100) {
                                showSnackbar("Error, el nombre no puede ser mayor a 100 caracteres");
                                throw new Error();
                            }
                            if (descripcion.length > 100) {
                                showSnackbar("Error, la descripcion no puede ser mayor a 100 caracteres");
                                throw new Error();
                            }
                            const product = { sku, nombre, precio, descripcion, cantidad, base64Image };
                            await insertProduct(product);
                            getProducts(currentPage, limit, order);
                        }, () => {
                            const fileInput = document.getElementById('file-input');
                            fileInput.addEventListener('change', (e) => {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const img = document.querySelector('img');
                                    img.src = reader.result;
                                };
                                reader.readAsDataURL(file);
                            });
                        }, 'Agregar Producto', { closeOnFailure: false });
                });
                usersButton.addEventListener('click', () => {
                    paginationControls.style.visibility = "visible";
                    currentPage = 1;
                    getFunction = () => { getUsers(currentPage, limit, order) };
                    getFunction();
                    for (const element of document.getElementsByClassName('tabcontent')) {
                        element.style.display = 'none';
                    }
                    document.getElementById('Usuarios').style.display = 'flex';
                });
                const productsButton = document.getElementById('products-button');
                productsButton.addEventListener('click', () => {
                    paginationControls.style.visibility = "visible";
                    currentPage = 1;
                    getFunction = () => { getProducts(currentPage, limit, order) };
                    getFunction();
                    for (const element of document.getElementsByClassName('tabcontent')) {
                        element.style.display = 'none';
                    }
                    document.getElementById('Productos').style.display = 'flex';
                });
                const ventasButton = document.getElementById('sells-button');
                ventasButton.addEventListener('click', () => {
                    paginationControls.style.visibility = "visible";
                    currentPage = 1;
                    getFunction = () => { getVentas(currentPage, limit, order) };
                    getFunction();
                    for (const element of document.getElementsByClassName('tabcontent')) {
                        element.style.display = 'none';
                    }
                    document.getElementById('Ventas').style.display = 'flex';
                });
                const historyButton = document.getElementById('history-button');
                historyButton.addEventListener('click', () => {
                    paginationControls.style.visibility = "visible";
                    currentPage = 1;
                    getFunction = () => { getBitacoras(currentPage, limit, order) };
                    getFunction();
                    for (const element of document.getElementsByClassName('tabcontent')) {
                        element.style.display = 'none';
                    }
                    document.getElementById('Historial').style.display = 'flex';
                });
                const addressButton = document.getElementById('address-button');
                addressButton.addEventListener('click', () => {
                    paginationControls.style.visibility = "hidden";
                    const addAddressButton = document.getElementById('add-address-button');
                    addAddressButton.onclick = () => showModal("Agregar una direccion",
                        `
                        <div class="input-container">
                            <label for="name">Nombre para identificar la dirección:</label>
                            <input type="text" id="name" name="name">
                        </div>
                        <div class="input-container">
                            <label for="cp">Codigo Postal:</label>
                            <input type="number" id="cp" name="cp" min='0' max='99999'>
                        </div>
                        <div class='input-container' style='width: 100%;'>
                            <label for='Direccion'>Direccion:</label>
                            <textarea id='Direccion' name='Direccion'></textarea>
                        </div>`, async () => {
                        const nombre = document.getElementById('name').value;
                        const direccion = document.getElementById('Direccion').value;
                        const cp = document.getElementById('cp').value;
                        if (!nombre || !direccion || !cp) {
                            showSnackbar('Por favor llena todos los campos');
                            throw new Error();
                        }
                        if (nombre.length > 40) {
                            showSnackbar("Error, el nombre de la direccion no puede ser mayor a 40 caracteres");
                            throw new Error();
                        }
                        if (direccion.length > 200) {
                            showSnackbar("Error, la direccion no puede ser mayor a 200 caracteres");
                            throw new Error();
                        }
                        if (cp.length != 5) {
                            showSnackbar('Codigo Postal invalido');
                            throw new Error();
                        }
                        const body = { nombre, direccion, cp };
                        await insertDireccion(body);
                        getDirecciones(currentPage, limit, order);
                    });
                    for (const element of document.getElementsByClassName('tabcontent')) {
                        element.style.display = 'none';
                    }
                    getDirecciones();
                    document.getElementById('Direcciones').style.display = 'flex';
                });
                document.getElementById('prev-page').addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        getFunction();
                    }
                });

                document.getElementById('next-page').addEventListener('click', () => {
                    const table = document.querySelector('.tabcontent[style*="flex"] table');
                    if (table && table.rows.length - 1 < limit) {
                        return;
                    }
                    currentPage++;
                    getFunction();
                });

                document.getElementById('order-select').addEventListener('change', (event) => {
                    order = event.target.value;
                    currentPage = 1;
                    getFunction();
                });
                document.getElementById('limit-select').addEventListener('change', (event) => {
                    limit = event.target.value;
                    currentPage = 1;
                    getFunction();
                });

            });
    } else {
        title.textContent += 'Usuario: ';

        fetch('templates/userpanel.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('panel-placeholder').innerHTML = data;
                const accountButton = document.getElementById('accountmod-button');
                const addressButton = document.getElementById('address-button');
                document.getElementById('save-changes-button').addEventListener('click', async () => {
                    const password = document.getElementById('password').value;
                    const email = document.getElementById('email').value;
                    try {
                        if (!email && !password) {
                            showSnackbar("Rellena alguno de los campos para guardar");
                            return;
                        }
                        if (email)
                            if (!validateEmail(email)) {
                                showSnackbar("Error en el formato de correo");
                                return;
                            }

                        if (password)
                            if (!validatePassword(password)) {
                                showSnackbar("Error, la contraseña debe contener de 5 a 60 caracteres, incluir al menos 1 letra y numero y solo los siguientes simbolos ._-");
                                return;
                            }
                        await fetchData('/changeUserDetails', 'PUT', { email, password });
                        showSnackbar("Editado Exitosamente");
                    } catch (error) {
                        showSnackbar("Error: " + JSON.parse(error.message).message);
                    }
                });
                accountButton.addEventListener('click', () => {
                    for (const element of document.getElementsByClassName('tabcontent')) {
                        element.style.display = 'none';
                    }
                    document.getElementById('Cuenta').style.display = 'flex';
                });
                addressButton.addEventListener('click', () => {
                    const addAddressButton = document.getElementById('add-address-button');
                    addAddressButton.addEventListener('click', () => showModal("Agregar una direccion",
                        `
                        <div class="input-container">
                            <label for="name">Nombre para identificar la dirección:</label>
                            <input type="text" id="name" name="name">
                        </div>
                        <div class="input-container">
                            <label for="cp">Codigo Postal:</label>
                            <input type="number" id="cp" name="cp" min='0' max='99999'>
                        </div>
                        <div class='input-container' style='width: 100%;'>
                            <label for='Direccion'>Direccion:</label>
                            <textarea id='Direccion' name='Direccion'></textarea>
                        </div>`, async () => {
                        const nombre = document.getElementById('name').value;
                        const direccion = document.getElementById('Direccion').value;
                        const cp = document.getElementById('cp').value;
                        if (!nombre || !direccion || !cp) {
                            showSnackbar('Por favor llena todos los campos');
                            throw new Error();
                        }
                        if (nombre.length > 40) {
                            showSnackbar("Error, el nombre de la direccion no puede ser mayor a 40 caracteres");
                            return;
                        }
                        if (direccion.length > 200) {
                            showSnackbar("Error, la direccion no puede ser mayor a 200 caracteres");
                            return;
                        }
                        if (cp.length != 5) {
                            showSnackbar('Codigo Postal invalido');
                            throw new Error();
                        }
                        const body = { nombre, direccion, cp };
                        await insertDireccion(body);
                        getDirecciones(currentPage, limit, order);
                    })
                    );
                    for (const element of document.getElementsByClassName('tabcontent')) {
                        element.style.display = 'none';
                    }
                    getDirecciones();
                    document.getElementById('Direcciones').style.display = 'flex';
                });
            });
    }
    title.textContent += jwt.Username;

});


