import { hideLoadingBackdrop, showLoadingBackdrop } from './loadingBackdrop.js';
import { fetchData } from './requests.js';

document.addEventListener('DOMContentLoaded', async () => {
    let currentPage = 1;
    let limit = 5;
    let order = 'ASC';
    let nextPage = true;
    let previousGridColumns = 0;
    const handleProductClick = (event) => {
        const sku = event.currentTarget.dataset.sku;
        window.location.href = `/productDetails.html?sku=${sku}`;
    };

    const loadProducts = async () => {
        try {
            showLoadingBackdrop();
            const products = await fetchData(`/selectProducts?page=${currentPage}&limit=${limit}&order=${order}`, 'GET');
            hideLoadingBackdrop();
            const page = document.getElementById('page-indicator');
            const template = document.getElementById('product-card-template');
            const productsGrid = document.querySelector('.products-grid');
            document.querySelectorAll('.products-grid .product-card').forEach(card => card.remove());
            page.textContent = 'Pagina: ' + currentPage;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (products.length == 0 || products.length < limit) {
                nextPage = false;
            }
            products.forEach(product => {
                const clone = template.content.cloneNode(true);
                clone.querySelector('.product-card').dataset.sku = product.SKU;
                clone.querySelector('img').src = product.ImagenBase64;
                clone.querySelector('img').alt = product.Nombre;
                clone.querySelector('h3').textContent = product.Nombre;
                clone.querySelector('p').textContent = '$' + product.Precio;
                clone.querySelector('.product-card').addEventListener('click', handleProductClick);
                productsGrid.appendChild(clone);
            });
            const gridColumns = getComputedStyle(productsGrid).gridTemplateColumns.split(' ').filter(value => value !== '0px').length;
            const missingColumns = currentPage == 1 ? 0 : previousGridColumns - gridColumns;
            if (missingColumns) {
                for (let i = 0; i < missingColumns; i++) {
                    const clone = template.content.cloneNode(true);
                    const invisibleCard = clone.querySelector('.product-card');
                    invisibleCard.style.visibility = 'hidden';
                    invisibleCard.style.padding = 0;
                    invisibleCard.style.margin = 0;
                    productsGrid.appendChild(clone);
                }
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    document.getElementById('prev-page').addEventListener('click', () => {
        nextPage = true;
        if (currentPage > 1) {
            currentPage--;
            loadProducts();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (!nextPage) {
            return;
        }
        const productsGrid = document.querySelector('.products-grid');
        previousGridColumns = getComputedStyle(productsGrid).gridTemplateColumns.split(' ').filter(value => value !== '0px').length;
        currentPage++;
        loadProducts();
    });

    document.getElementById('order-select').addEventListener('change', (event) => {
        order = event.target.value;
        currentPage = 1;
        nextPage = true;
        loadProducts();
    });
    document.getElementById('limit-select').addEventListener('change', (event) => {
        limit = event.target.value;
        currentPage = 1;
        nextPage = true;
        loadProducts();
    });

    loadProducts();
});