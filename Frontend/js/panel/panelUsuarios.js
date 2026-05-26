import { showModal } from '../modal.js';
import { fetchData } from '../requests.js';
import { showSnackbar } from '../snackbar.js';
import { validateEmail, validatePassword } from '../validators.js';

async function getUsers(currentPage = 1, limit = 5, order = 'ASC') {
    try {
        const users = await fetchData(`/selectUsers?page=${currentPage}&limit=${limit}&order=${order}`, 'GET');
        const usersTable = document.getElementById('users-table');
        const template = document.getElementById('user-row-template');
        document.querySelectorAll('.user-row').forEach(row => row.remove());
        users.forEach(user => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.user-row').dataset.id = user.username;
            clone.querySelector('.user-name').textContent = user.username;
            clone.querySelector('.user-role').textContent = user.role;
            clone.querySelector('.user-email').textContent = user.email;
            clone.querySelector('.edit-button').addEventListener('click', async () => {
                const data = await fetch('templates/panel/user.html').then(response => response.text())
                showModal('Modificar usuario ' + user.username, data, async () => {
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
                    const body = { username, oldUsername: user.username, role, email, password };
                    await modifyUser(body);
                    getUsers(currentPage, limit, order);
                }, () => {
                    document.getElementById('password-label').innerText = 'Contraseña  (Opcional):';
                    document.getElementById('username').value = user.username;
                    document.getElementById('role').value = user.role;
                    document.getElementById('email').value = user.email;
                });
            });
            clone.querySelector('.delete-button').addEventListener('click', () => {
                showModal('Eliminar Usuario',
                    `Seguro que quieres eliminar al usuario ${user.username}?`,
                    async () => {
                        await deleteUser(user.username, currentPage, limit, order);
                    }, () => { }, "Eliminar"
                );
            });
            usersTable.appendChild(clone);
        });

    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}
async function modifyUser(user) {
    try {
        await fetchData('/modifyUser', 'PUT', user)
        showSnackbar('Usuario actualizado exitosamente');
    }
    catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    };
}

async function registerAdmin(params) {
    try {
        await fetchData('/registerAdmin', 'POST', params)
        showSnackbar('Usuario registrado exitosamente');
    }
    catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    };
}

async function deleteUser(username, currentPage, limit, order) {
    try {
        await fetchData(`/deleteUser`, 'DELETE', { username });
        showSnackbar('Usuario Eliminado exitosamente');
        getUsers(currentPage, limit, order);
    } catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    }
}

export { getUsers, registerAdmin };