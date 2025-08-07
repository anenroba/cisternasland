const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('search-input');
const API_URL = 'https://api-swa.onrender.com/api/carta';
const LOCAL_STORAGE_KEY = 'cisternasMenuData';

let menuDataGlobal = []; // Almacenará los datos originales de la carta

// Función para obtener los datos de la carta, usando localStorage
async function fetchAndCacheMenu() {
    menuContainer.innerHTML = '<p class="loading-message">Cargando carta...</p>';

    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedData) {
        console.log('Cargando carta desde localStorage...');
        menuDataGlobal = JSON.parse(cachedData);
        renderMenu(menuDataGlobal);
        return;
    }

    console.log('Cargando carta desde la API...');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        menuDataGlobal = data;
        
        renderMenu(menuDataGlobal);
    } catch (error) {
        console.error('Error al obtener la carta:', error);
        menuContainer.innerHTML = '<p class="loading-message">Error al cargar la carta. Por favor, inténtelo de nuevo más tarde.</p>';
    }
}

// Función para renderizar la carta en el HTML usando la estructura de la API
function renderMenu(dataToRender) {
    menuContainer.innerHTML = '';
    if (!dataToRender || dataToRender.length === 0) {
        menuContainer.innerHTML = '<p class="loading-message">La carta está vacía.</p>';
        return;
    }

    // Usaremos un Set para mantener un registro de las categorías ya renderizadas
    const renderedCategories = new Set();
    
    dataToRender.forEach(item => {
        // Si la categoría no ha sido renderizada, la creamos
        if (!renderedCategories.has(item.categoria)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
            categoryDiv.id = `category-${item.categoria.replace(/\s/g, '-')}`;

            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.innerHTML = `
                <h3>${item.categoria}</h3>
                <i class="fas fa-chevron-down"></i>
            `;
            categoryDiv.appendChild(categoryHeader);

            const subcategoriesContainer = document.createElement('div');
            subcategoriesContainer.classList.add('subcategories-container');
            categoryDiv.appendChild(subcategoriesContainer);

            menuContainer.appendChild(categoryDiv);
            renderedCategories.add(item.categoria);
        }

        // Ahora que la categoría existe, buscamos el contenedor de subcategorías
        const currentCategoryDiv = document.getElementById(`category-${item.categoria.replace(/\s/g, '-')}`);
        const subcategoriesContainer = currentCategoryDiv.querySelector('.subcategories-container');
        
        // Creamos la subcategoría y sus productos
        const subcategoryHeader = document.createElement('div');
        subcategoryHeader.classList.add('subcategory-header');
        subcategoryHeader.innerHTML = `
            <h4>${item.subcategoria}</h4>
            <i class="fas fa-chevron-down"></i>
        `;
        subcategoriesContainer.appendChild(subcategoryHeader);

        const productsContainer = document.createElement('div');
        productsContainer.classList.add('products-container');
        subcategoriesContainer.appendChild(productsContainer);
        
        item.productos.forEach(producto => {
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
    
    // Filtramos los datos a nivel de subcategoría
    const filteredData = menuDataGlobal.map(item => {
        // Filtramos los productos dentro de cada subcategoría
        const filteredProductos = item.productos.filter(producto =>
            producto.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            producto.descripcion.toLowerCase().includes(lowerCaseSearchTerm)
        );
        // Devolvemos el ítem de la subcategoría solo si tiene productos que coinciden
        if (filteredProductos.length > 0) {
            return {
                ...item,
                productos: filteredProductos
            };
        }
        return null;
    }).filter(item => item !== null); // Eliminar las subcategorías vacías

    renderMenu(filteredData);

    // Expandir las categorías y subcategorías si se está buscando
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