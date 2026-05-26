import { showModal } from "./modal.js";
import { fetchData } from "./requests.js";
import { showSnackbar } from './snackbar.js';
document.addEventListener('DOMContentLoaded', () => {
    getCarrito();
    document.getElementById('buy-button').addEventListener('click', async () => {
        if (document.querySelectorAll('.cart-row').length === 0) {
            showSnackbar('No hay productos en el carrito');
            return;
        }
        try {
            //TODO: Implementar la compra por paypal o mandar un correo con los productos, ademas de la direccion del cliente
            showModal('Completa la informacion de compra', getModalBody(), onClickModal, modalScript);
            getCarrito();
        } catch (error) {
            showSnackbar('Error al realizar la compra');
        }
    });
});
async function getCarrito() {
    try {
        const carrito = await fetchData('/selectCarrito', 'GET');
        const cartTable = document.getElementById('cart-table');
        const template = document.getElementById('cart-row-template');
        document.querySelectorAll('.cart-row').forEach(row => row.remove());
        let total = 0;
        carrito.forEach(product => {
            total += product.Total;
            const clone = template.content.cloneNode(true);
            clone.querySelector('.cart-row').dataset.id = product.ID;
            clone.querySelector('.cart-sku').textContent = product.SKU;
            clone.querySelector('.cart-sku').href = `/productDetails.html?sku=${product.SKU}`;
            clone.querySelector('.cart-nombre').textContent = product.Nombre;
            clone.querySelector('.cart-cantidad').textContent = product.Cantidad;
            clone.querySelector('.cart-precio-unitario').textContent = '$' + product.PrecioUnitario;
            clone.querySelector('.cart-subtotal').textContent = '$' + product.Total;
            clone.querySelector('.edit-button').addEventListener('click', () => {
                showModal('Editar cantidad', `<div class="input-container"> <label for="quantity">Cantidad</label> <input type="number" id="quantity" placeholder="Cantidad" value="${product.Cantidad}" min="1" max="${product.Stock}"> </div>`, async () => {
                    const cantidad = Number(document.getElementById('quantity').value);
                    if (!cantidad || cantidad < 1) {
                        showSnackbar('Por favor llena todos los campos');
                        throw new Error();
                    }
                    const body = { id: product.ID, cantidad };
                    try {
                        await fetchData('/updateCarrito', 'PUT', body);
                        showSnackbar('Cantidad actualizada');
                        getCarrito();
                    } catch (error) {
                        showSnackbar('Error: ' + JSON.parse(error.message).message);
                        throw error;
                    }
                });
            });
            clone.querySelector('.delete-button').addEventListener('click', () => {
                showModal('Eliminar Producto',
                    `Seguro que quieres eliminar el producto ${product.SKU}?`,
                    async () => {
                        await deleteCarrito(product.ID);
                    }, () => { }, "Eliminar"
                    , { closeOnFailure: true }
                );
            });
            cartTable.appendChild(clone);
        });
        document.getElementById('cart-total').textContent = '$' + total;
    } catch (error) {
        showSnackbar('Error al cargar el carrito');
    }
}
async function deleteCarrito(id) {
    try {
        await fetchData(`/deleteCarrito`, 'DELETE', { id });
        showSnackbar('Producto eliminado exitosamente');
        getCarrito();
    } catch (error) {
        showSnackbar('Error: ' + JSON.parse(error.message).message);
        throw error;
    }
}
function getModalBody() {
    return `<div class="input-container">
                <label for="pay">Metodo de pago:</label>
                <select id="payment-method" name="pay">
                    <option value="1">Referencia por email</option>
                    <option value="2">Paypal</option>
                </select>
            </div>
            <div class="input-container">
                <label for="address-select">Direccion:</label>
                <select id="address-select" name="address-select">
                    <option disabled>Cargando...</option>
                </select>
                <a href="/cuenta.html">+ Agregar una direccion</a>
            </div>`;
}
async function modalScript() {
    const select = document.getElementById('address-select');
    select.innerHTML = '<option value="" disabled>Seleccione una direccion</option>';
    try {
        const direcciones = await fetchData('/selectDirecciones', 'GET');
        direcciones.forEach(direccion => {
            const option = document.createElement('option');
            option.value = direccion.id;
            option.textContent = direccion.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        showSnackbar('Error al cargar las direcciones');
        select.innerHTML = '<option value="">No hay direcciones guardadas</option>';
    }
}
async function onClickModal() {
    const payMethod = Number(document.getElementById('payment-method').value);
    const idDireccion = document.getElementById('address-select').value;
    if (!payMethod || !idDireccion) {
        showSnackbar("Completa el formulario para continuar");
        throw new Error();
    }
    if (payMethod != 1) {
        //await fetchData('/comprar', 'POST', { payMethod, idDireccion });
        localStorage.setItem('idDireccion', idDireccion);
        window.location.href= "/paypal.html";
        //paypal here
    }
    else {
        try {
            await fetchData('/comprar', 'POST', { payMethod, idDireccion });
            showSnackbar("Compra realizada con exito");
            setTimeout(() => window.location.href = "/products.html", 1000);
        } catch (error) {
            showSnackbar("Error: " + error);
            throw Error;
        }
    }
    }