const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('search-input');
const API_URL = 'https://api-swa.onrender.com/api/carta';
const LOCAL_STORAGE_KEY = 'cisternasMenuData';

let menuDataGlobal = []; // Almacenará los datos originales de la carta

// Función para obtener los datos de la carta
async function fetchAndCacheMenu() {
    menuContainer.innerHTML = '<p class="loading-message">Cargando carta...</p>';

    // 1. Intentar obtener los datos de localStorage
    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedData) {
        console.log('Cargando carta desde localStorage...');
        menuDataGlobal = JSON.parse(cachedData);
        renderMenu(menuDataGlobal);
        // Si hay datos en caché, no es necesario hacer una llamada API,
        // pero podrías hacer una en segundo plano para actualizar si es necesario.
        return;
    }

    // 2. Si no hay datos en localStorage, obtener de la API
    console.log('Cargando carta desde la API...');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 3. Guardar los datos en localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        menuDataGlobal = data;
        
        renderMenu(menuDataGlobal);
    } catch (error) {
        console.error('Error al obtener la carta:', error);
        menuContainer.innerHTML = '<p class="loading-message">Error al cargar la carta. Por favor, inténtelo de nuevo más tarde.</p>';
    }
}

// Función para renderizar la carta en el HTML
function renderMenu(dataToRender) {
    menuContainer.innerHTML = '';
    if (dataToRender.length === 0) {
        menuContainer.innerHTML = '<p class="loading-message">La carta está vacía.</p>';
        return;
    }

    dataToRender.forEach(categoria => {
        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');
        categoryHeader.innerHTML = `
            <h3>${categoria.categoria}</h3>
            <i class="fas fa-chevron-down"></i>
        `;
        menuContainer.appendChild(categoryHeader);

        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.classList.add('subcategories-container');
        menuContainer.appendChild(subcategoriesContainer);

        categoria.productos.forEach(subcategoria => {
            const subcategoryHeader = document.createElement('div');
            subcategoryHeader.classList.add('subcategory-header');
            subcategoryHeader.innerHTML = `
                <h4>${subcategoria.nombre}</h4>
                <i class="fas fa-chevron-down"></i>
            `;
            subcategoriesContainer.appendChild(subcategoryHeader);

            const productsContainer = document.createElement('div');
            productsContainer.classList.add('products-container');
            subcategoriesContainer.appendChild(productsContainer);

            subcategoria.productos.forEach(producto => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.innerHTML = `
                    <div class="product-info">
                        <p class="product-name">${producto.nombre}</p>
                        <p class="product-description">${producto.descripcion}</p>
                    </div>
                    <span class="product-price">$${new Intl.NumberFormat('es-CL').format(producto.precio)}</span>
                `;
                productsContainer.appendChild(productCard);
            });
        });
    });

    addAccordionFunctionality();
}

function addAccordionFunctionality() {
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            content.style.maxHeight = header.classList.contains('active') ? content.scrollHeight + 'px' : '0';
        });
    });

    document.querySelectorAll('.subcategory-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            content.style.maxHeight = header.classList.contains('active') ? content.scrollHeight + 'px' : '0';
        });
    });
}

function filterMenu(searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filteredData = menuDataGlobal.map(categoria => {
        const filteredSubcategorias = categoria.productos.map(subcategoria => {
            const filteredProductos = subcategoria.productos.filter(producto =>
                producto.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                producto.descripcion.toLowerCase().includes(lowerCaseSearchTerm)
            );
            return { ...subcategoria, productos: filteredProductos };
        }).filter(subcategoria => subcategoria.productos.length > 0);

        return { ...categoria, productos: filteredSubcategorias };
    }).filter(categoria => categoria.productos.length > 0);

    renderMenu(filteredData);
    if (searchTerm) {
        document.querySelectorAll('.category-header, .subcategory-header').forEach(header => {
            header.classList.add('active');
            header.nextElementSibling.style.maxHeight = header.nextElementSibling.scrollHeight + 'px';
        });
    }
}

searchInput.addEventListener('input', (e) => {
    filterMenu(e.target.value);
});

document.addEventListener('DOMContentLoaded', fetchAndCacheMenu);