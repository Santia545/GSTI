import { decodeJWT } from './auth.js';
import { showModal } from './modal.js';
import { fetchData } from './requests.js';
import { showSnackbar } from './snackbar.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sku = urlParams.get('sku');
    const jwt = decodeJWT();
    let stock = 0;
    if (sku) {
        try {
            const product = await fetchData(`/selectProduct?sku=${sku}`, 'GET');
            stock = product[0].Stock;
            const productDetails = document.getElementById('product-details');
            productDetails.innerHTML = `
                    <img src="${product[0].ImagenBase64}" alt="${product.Nombre}">
                <div class='product-details-container' style='display: flex; flex-direction: column; flex-wrap: wrap; flex-grow:1 '>
                    <h1 style="word-wrap: break-word; overflow-wrap: anywhere; white-space: normal;">${product[0].Nombre}</h1>
                    <p style='color:gray'>Existencia: ${product[0].Stock}</p>
                    <p style='word-wrap: break-word; overflow-wrap: anywhere; white-space: normal;'>${product[0].Descripcion}</p>
                    <p>Precio: $${product[0].Precio}</p>
                    <button id='buy-button' style='margin-top:auto; margin-left:auto'>Agregar al carrito</button>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
        const buyButton = document.getElementById('buy-button');
        if (!jwt) {
            showSnackbar('Inicia sesion para agregar productos al carrito', true, () => window.location.href = 'login.html');
            buyButton.style.display = 'none';
        } else {
            if (!stock) {
                buyButton.innerText = 'No Disponible';
                buyButton.disabled = true;
                buyButton.style.backgroundColor = 'red';
            }
            buyButton.addEventListener('click', () => {
                showModal('Agregar productos al carrito', `<div class="input-container"> <label for="quantity">Cantidad</label> <input type="number" id="quantity" placeholder="Cantidad" value="1" min="1" max="${stock}"> </div>`, async () => {
                    const cantidad = Number(document.getElementById('quantity').value);
                    if (!cantidad || cantidad < 1) {
                        showSnackbar('Por favor llena todos los campos');
                        throw new Error();
                    }
                    const body = { sku, cantidad };
                    try {
                        await fetchData('/insertCarrito', 'POST', body);
                        showSnackbar('Producto agregado al carrito');
                    } catch (error) {
                        showSnackbar('Error: ' + JSON.parse(error.message).message);
                        throw error;
                    }
                });
            });
        }
    } else {
        console.error('No SKU found in URL');
        window.location.href = 'products.html';
    }
});