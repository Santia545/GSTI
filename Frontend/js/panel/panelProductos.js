import { showModal } from '../modal.js';
import { fetchData } from '../requests.js';
import { showSnackbar } from '../snackbar.js';

async function getProducts(currentPage = 1, limit = 5, order = 'ASC') {
    try {
        const users = await fetchData(`/selectProducts?page=${currentPage}&limit=${limit}&order=${order}`, 'GET');
        const usersTable = document.getElementById('products-table');
        const template = document.getElementById('product-row-template');
        document.querySelectorAll('.product-row').forEach(row => row.remove());
        const modalBody = await fetch('templates/panel/product.html').then(response => response.text());
        users.forEach(product => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.product-row').dataset.id = product.SKU;
            clone.querySelector('.product-sku').textContent = product.SKU;
            clone.querySelector('.product-name').textContent = product.Nombre;
            clone.querySelector('.product-price').textContent = product.Precio;
            clone.querySelector('.edit-button').addEventListener('click', () => {
                showModal('Modificar producto ' + product.SKU, modalBody,
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
                        const productBody = { oldSku: product.SKU, sku, nombre, precio, descripcion, cantidad, base64Image };
                        await updateProduct(productBody);
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
                        document.getElementById('sku').value = product.SKU;
                        document.getElementById('nombre').value = product.Nombre;
                        document.getElementById('precio').value = product.Precio;
                        document.getElementById('descripcion').value = product.Descripcion;
                        document.getElementById('cantidad').value = product.Cantidad;
                        document.querySelector('img').src = product.ImagenBase64;
                    });
            });
            clone.querySelector('.delete-button').addEventListener('click', () => {
                showModal('Eliminar Producto',
                    `Seguro que quieres eliminarel producto ${product.SKU}?`,
                    async () => {
                        await deleteProduct(product.SKU, currentPage, limit, order);
                    }, () => { }, "Eliminar"
                    , { closeOnFailure: true }
                );
            });
            usersTable.appendChild(clone);
        });

    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}
async function insertProduct(product) {
    try {
        await fetchData('/insertProduct', 'POST', product);
        showSnackbar('Producto registrado exitosamente');
    }
    catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    }
}
async function updateProduct(product) {
    try {
        await fetchData('/updateProduct', 'PUT', product);
        showSnackbar('Producto actualizado exitosamente');
    }
    catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    }
}
async function deleteProduct(sku, currentPage, limit, order) {
    try {
        await fetchData(`/deleteProduct`, 'DELETE', { sku });
        showSnackbar('Producto eliminado exitosamente');
        getProducts(currentPage, limit, order);
    } catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    }
}
export { getProducts, insertProduct };