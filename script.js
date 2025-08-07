const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('search-input');
const initialButtons = document.getElementById('initial-buttons');
const menuContent = document.getElementById('menu-content');
const drinkMeBtn = document.getElementById('drink-me-btn');
const eatMeBtn = document.getElementById('eat-me-btn');

const API_URL = 'https://api-swa.onrender.com/api/carta';
const LOCAL_STORAGE_KEY = 'cisternasMenuData';

let menuDataGlobal = []; // Almacenará los datos originales de la carta
let currentFilteredData = []; // Almacenará los datos de la sección activa (Bebida o Comida)

// Mapeo de categorías principales a las secciones "DRINK ME" y "EAT ME"
const DRINK_ME_CATEGORIES = new Set([
    'Bebida', 'Coctelería', 'Sours', 'Mojitos', 'Spritz', 'Tequila', 'Clásicos de Siempre',
    'Piscos', 'Whisky', 'Vinos & Espumantes', 'Gin'
]);
const EAT_ME_CATEGORIES = new Set([
    'Comida', 'Tablas', 'Sushi', 'Dulce Final', 'Piqueos', 'Hamburguesas', 'Pastas'
]);

// Función para obtener los datos de la carta, usando localStorage
async function fetchAndCacheMenu() {
    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedData) {
        console.log('Cargando carta desde localStorage...');
        menuDataGlobal = JSON.parse(cachedData);
    } else {
        console.log('Cargando carta desde la API...');
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            menuDataGlobal = data;
        } catch (error) {
            console.error('Error al obtener la carta:', error);
            menuContainer.innerHTML = '<p class="loading-message">Error al cargar la carta. Por favor, inténtelo de nuevo más tarde.</p>';
        }
    }
}

// Función para renderizar la carta en el HTML usando la estructura de la API
function renderMenu(dataToRender) {
    menuContainer.innerHTML = '';
    if (!dataToRender || dataToRender.length === 0) {
        menuContainer.innerHTML = '<p class="loading-message">La carta está vacía.</p>';
        return;
    }

    const renderedCategories = new Set();
    
    dataToRender.forEach(item => {
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

        const currentCategoryDiv = document.getElementById(`category-${item.categoria.replace(/\s/g, '-')}`);
        const subcategoriesContainer = currentCategoryDiv.querySelector('.subcategories-container');
        
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
    
    // Filtramos los datos de la sección activa, no los globales
    const filteredData = currentFilteredData.map(item => {
        const filteredProductos = item.productos.filter(producto =>
            producto.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            producto.descripcion.toLowerCase().includes(lowerCaseSearchTerm)
        );
        if (filteredProductos.length > 0) {
            return {
                ...item,
                productos: filteredProductos
            };
        }
        return null;
    }).filter(item => item !== null);
    
    renderMenu(filteredData);

    if (searchTerm) {
        document.querySelectorAll('.category-header, .subcategory-header').forEach(header => {
            header.classList.add('active');
            header.nextElementSibling.style.maxHeight = header.nextElementSibling.scrollHeight + 'px';
        });
    }
}

// Eventos de los botones principales
drinkMeBtn.addEventListener('click', () => {
    initialButtons.classList.add('hidden');
    menuContent.classList.remove('hidden');
    currentFilteredData = menuDataGlobal.filter(item => DRINK_ME_CATEGORIES.has(item.categoria));
    renderMenu(currentFilteredData);
});

eatMeBtn.addEventListener('click', () => {
    initialButtons.classList.add('hidden');
    menuContent.classList.remove('hidden');
    currentFilteredData = menuDataGlobal.filter(item => EAT_ME_CATEGORIES.has(item.categoria));
    renderMenu(currentFilteredData);
});

searchInput.addEventListener('input', (e) => {
    filterMenu(e.target.value);
});

// Cargar los datos y preparar la UI
document.addEventListener('DOMContentLoaded', fetchAndCacheMenu);