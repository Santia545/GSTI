import { fetchData } from '../requests.js';

async function getVentas(currentPage = 1, limit = 5, order = 'ASC') {
    try {
        const ventas = await fetchData(`/selectVentas?page=${currentPage}&limit=${limit}&order=${order}`, 'GET');
        const ventasTable = document.getElementById('ventas-table');
        const template = document.getElementById('venta-row-template');
        document.querySelectorAll('.venta-row').forEach(row => row.remove());
        ventas.forEach(venta => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.venta-row').dataset.id = venta.mes;
            clone.querySelector('.venta-month').textContent = venta.mes;
            clone.querySelector('.venta-total').textContent = "$" + venta.total;
            ventasTable.appendChild(clone);
        });

    } catch (error) {
        console.error('Error fetching sells details:', error);
    }
}
export { getVentas };