const menuContainer = document.getElementById('menu-container');
const API_URL = 'http://localhost:3000/api/carta'; // Asegúrate de que esta URL sea correcta

// Función para obtener los datos de la carta
async function fetchMenu() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderMenu(data);
    } catch (error) {
        console.error('Error al obtener la carta:', error);
        menuContainer.innerHTML = '<p class="loading-message">Error al cargar la carta. Por favor, inténtelo de nuevo más tarde.</p>';
    }
}

// Función para renderizar la carta en el HTML
function renderMenu(menuData) {
    menuContainer.innerHTML = ''; // Limpia el mensaje de "Cargando..."

    if (menuData.length === 0) {
        menuContainer.innerHTML = '<p class="loading-message">La carta está vacía.</p>';
        return;
    }

    menuData.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category.categoria;
        categoryDiv.appendChild(categoryTitle);

        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.classList.add('subcategory');

        const subcategoryTitle = document.createElement('h4');
        subcategoryTitle.textContent = category.subcategoria;
        subcategoryDiv.appendChild(subcategoryTitle);

        category.productos.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');

            const productInfo = document.createElement('div');
            productInfo.classList.add('product-info');

            const productName = document.createElement('span');
            productName.classList.add('product-name');
            productName.textContent = product.nombre;
            
            const productDescription = document.createElement('p');
            productDescription.classList.add('product-description');
            productDescription.textContent = product.descripcion;

            productInfo.appendChild(productName);
            productInfo.appendChild(productDescription);

            const productPrice = document.createElement('span');
            productPrice.classList.add('product-price');
            productPrice.textContent = `$${new Intl.NumberFormat('es-CL').format(product.precio)}`;

            productDiv.appendChild(productInfo);
            productDiv.appendChild(productPrice);
            
            subcategoryDiv.appendChild(productDiv);
        });

        categoryDiv.appendChild(subcategoryDiv);
        menuContainer.appendChild(categoryDiv);
    });
}

// Iniciar la carga de la carta
document.addEventListener('DOMContentLoaded', fetchMenu);