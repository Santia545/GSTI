import { fetchData } from '../requests.js';

async function getBitacoras(currentPage = 1, limit = 5, order = 'ASC') {
    try {
        const bitacoras = await fetchData(`/selectBitacoras?page=${currentPage}&limit=${limit}&order=${order}`, 'GET');
        const bitacorasTable = document.getElementById('bitacoras-table');
        const template = document.getElementById('bitacora-row-template');
        document.querySelectorAll('.bitacora-row').forEach(row => row.remove());
        bitacoras.forEach(bitacora => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.bitacora-row').dataset.id = bitacora.Id;
            clone.querySelector('.bitacora-action').textContent = bitacora.Accion;
            clone.querySelector('.bitacora-date').textContent = bitacora.Fecha;
            clone.querySelector('.bitacora-table').textContent = bitacora.Tabla;
            clone.querySelector('.bitacora-user').textContent = bitacora.User;
            clone.querySelector('.bitacora-contrasentence').textContent = bitacora.Contrasentencia;
            bitacorasTable.appendChild(clone);
        });

    } catch (error) {
        console.error('Error fetching bitacora details:', error);
    }
}

export { getBitacoras };