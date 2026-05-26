import { showModal } from '../modal.js';
import { fetchData } from '../requests.js';
import { showSnackbar } from '../snackbar.js';

async function getDirecciones() {
    try {
        const direcciones = await fetchData(`/selectDirecciones`, 'GET');
        const direccionesTable = document.getElementById('address-table');
        const template = document.getElementById('address-row-template');
        document.querySelectorAll('.address-row').forEach(row => row.remove());
        direcciones.forEach(direccion => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.address-row').dataset.id = direccion.id;
            clone.querySelector('.address-name').textContent = direccion.nombre;
            clone.getElementById('see-button').addEventListener('click', () => {
                showModal(direccion.nombre,
                    `<p id='direccion-display'></p>`,
                    () => {
                    }, async () => {
                        const result = (await selectDireccion(direccion.id))[0];
                        document.getElementById('direccion-display').innerText = `Direccion: ${result.Direccion} \n CP: ${result.CP}`;
                    }
                );
            });
            clone.querySelector('.delete-button').addEventListener('click', () => {
                showModal('Eliminar Direccion?',
                    `Seguro que quieres eliminar la direccion ${direccion.nombre}?`,
                    async () => {
                        await deleteDireccion(direccion.id);
                    }, () => { }, "Eliminar"
                );
            });
            direccionesTable.appendChild(clone);
        });

    } catch (error) {
        console.error('Error fetching address details:', error);
    }
}
async function selectDireccion(id) {
    try {
        return await fetchData(`/selectDireccion`, 'GET', { id });
    } catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    }
}
async function deleteDireccion(id) {
    try {
        await fetchData(`/deleteDireccion`, 'DELETE', { id });
        showSnackbar('Direccion eliminada exitosamente');
        getDirecciones();
    } catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    }
}
async function insertDireccion(direccion) {
    try {
        await fetchData('/insertDireccion', 'POST', direccion);
        showSnackbar('Direccion registrada exitosamente');
    }
    catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    }
}
export { getDirecciones, insertDireccion };