const initialButtonsContainer = document.getElementById('initial-buttons');
const mainMenu = document.getElementById('main-menu');
const drinkMeBtnInitial = document.getElementById('drink-me-btn-initial');
const eatMeBtnInitial = document.getElementById('eat-me-btn-initial');
const drinkMeBtnTop = document.getElementById('drink-me-btn-top');
const eatMeBtnTop = document.getElementById('eat-me-btn-top');
const searchInput = document.getElementById('search-input');
const drinkColumn = document.getElementById('drink-column');
const eatColumn = document.getElementById('eat-column');
const API_URL = 'https://api-swa.onrender.com/api/carta';
const LOCAL_STORAGE_KEY = 'cisternasMenuData';

let menuDataGlobal = [];
let currentFilteredData = [];
let activeSection = '';

const DRINK_ME_CATEGORIES = new Set(['Bebida', 'Coctelería', 'Sours', 'Mojitos', 'Spritz', 'Tequila', 'Clásicos de Siempre', 'Piscos', 'Whisky', 'Vinos & Espumantes', 'Gin']);
const EAT_ME_CATEGORIES = new Set(['Comida', 'Tablas', 'Sushi', 'Dulce Final', 'Piqueos', 'Hamburguesas', 'Pastas']);

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
            // Manejar error en la interfaz inicial si no se pueden obtener datos
            initialButtonsContainer.innerHTML = '<p class="loading-message">Error al cargar la carta. Por favor, inténtelo de nuevo más tarde.</p>';
        }
    }
}

function showSection(section) {
    if (section === 'drink') {
        currentFilteredData = menuDataGlobal.filter(item => DRINK_ME_CATEGORIES.has(item.categoria));
        drinkColumn.classList.remove('hidden-column');
        eatColumn.classList.add('hidden-column');
        drinkMeBtnTop.classList.add('active');
        eatMeBtnTop.classList.remove('active');
        activeSection = 'drink';
    } else if (section === 'eat') {
        currentFilteredData = menuDataGlobal.filter(item => EAT_ME_CATEGORIES.has(item.categoria));
        eatColumn.classList.remove('hidden-column');
        drinkColumn.classList.add('hidden-column');
        eatMeBtnTop.classList.add('active');
        drinkMeBtnTop.classList.remove('active');
        activeSection = 'eat';
    }
    renderSection(currentFilteredData, activeSection);
}

function renderSection(dataToRender, section) {
    const columnElement = section === 'drink' ? drinkColumn : eatColumn;
    
    // Limpiar el contenido existente y mostrar un mensaje de carga inicial si es necesario
    columnElement.innerHTML = '';
    if (!dataToRender || dataToRender.length === 0) {
        columnElement.innerHTML = `<p class="loading-message">No hay ítems en esta sección.</p>`;
        return;
    }

    const groupedData = {};
    dataToRender.forEach(item => {
        if (!groupedData[item.categoria]) {
            groupedData[item.categoria] = {};
        }
        if (!groupedData[item.categoria][item.subcategoria]) {
            groupedData[item.categoria][item.subcategoria] = [];
        }
        groupedData[item.categoria][item.subcategoria].push(...item.productos);
    });

    for (const categoria in groupedData) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');
        categoryHeader.innerHTML = `
            <h3>${categoria}</h3>
            <i class="fas fa-chevron-down"></i>
        `;
        categoryDiv.appendChild(categoryHeader);

        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.classList.add('subcategories-container');
        
        for (const subcategoria in groupedData[categoria]) {
            const subcategoryHeader = document.createElement('div');
            subcategoryHeader.classList.add('subcategory-header');
            subcategoryHeader.innerHTML = `
                <h4>${subcategoria}</h4>
                <i class="fas fa-chevron-down"></i>
            `;
            subcategoriesContainer.appendChild(subcategoryHeader);

            const productsContainer = document.createElement('div');
            productsContainer.classList.add('products-container');
            
            groupedData[categoria][subcategoria].forEach(producto => {
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
            subcategoriesContainer.appendChild(productsContainer);
        }
        categoryDiv.appendChild(subcategoriesContainer);
        columnElement.appendChild(categoryDiv);
    }
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
    
    const filteredData = menuDataGlobal.filter(item => {
        const itemMatches = item.productos.some(producto =>
            producto.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(lowerCaseSearchTerm))
        );
        const categoryMatches = item.categoria.toLowerCase().includes(lowerCaseSearchTerm);
        const subcategoryMatches = item.subcategoria.toLowerCase().includes(lowerCaseSearchTerm);
        return itemMatches || categoryMatches || subcategoryMatches;
    });

    if (activeSection === 'drink') {
        const filteredDrinkData = filteredData.filter(item => DRINK_ME_CATEGORIES.has(item.categoria));
        renderSection(filteredDrinkData, 'drink');
    } else if (activeSection === 'eat') {
        const filteredEatData = filteredData.filter(item => EAT_ME_CATEGORIES.has(item.categoria));
        renderSection(filteredEatData, 'eat');
    }

    if (searchTerm) {
        document.querySelectorAll('.category-header, .subcategory-header').forEach(header => {
            header.classList.add('active');
            const content = header.nextElementSibling;
            if (content) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    }
}

// Eventos de los botones
drinkMeBtnInitial.addEventListener('click', () => {
    initialButtonsContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    showSection('drink');
});

eatMeBtnInitial.addEventListener('click', () => {
    initialButtonsContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    showSection('eat');
});

drinkMeBtnTop.addEventListener('click', () => showSection('drink'));
eatMeBtnTop.addEventListener('click', () => showSection('eat'));

searchInput.addEventListener('input', (e) => {
    filterMenu(e.target.value);
});

document.addEventListener('DOMContentLoaded', fetchAndCacheMenu);