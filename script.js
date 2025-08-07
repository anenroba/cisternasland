const drinkColumn = document.getElementById('drink-column');
const eatColumn = document.getElementById('eat-column');
const searchInput = document.getElementById('search-input');
const API_URL = 'https://api-swa.onrender.com/api/carta';
const LOCAL_STORAGE_KEY = 'cisternasMenuData';

let menuDataGlobal = [];

const DRINK_ME_CATEGORIES = new Set(['Coctelería', 'Sours', 'Mojitos', 'Spritz', 'Tequila', 'Clásicos de Siempre', 'Piscos', 'Whisky', 'Vinos & Espumantes', 'Gin']);
const EAT_ME_CATEGORIES = new Set(['Comida', 'Tablas', 'Sushi', 'Dulce Final', 'Piqueos', 'Hamburguesas', 'Pastas']);

async function fetchAndCacheMenu() {
    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedData) {
        console.log('Cargando carta desde localStorage...');
        menuDataGlobal = JSON.parse(cachedData);
        renderMenu(menuDataGlobal);
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
            renderMenu(menuDataGlobal);
        } catch (error) {
            console.error('Error al obtener la carta:', error);
            drinkColumn.innerHTML = `<p class="loading-message">Error al cargar las bebidas.</p>`;
            eatColumn.innerHTML = `<p class="loading-message">Error al cargar las comidas.</p>`;
        }
    }
}

function renderMenu(dataToRender) {
    drinkColumn.innerHTML = '<h2 class="column-title">DRINK ME 🥤</h2>';
    eatColumn.innerHTML = '<h2 class="column-title">EAT ME 🍔</h2>';
    
    if (!dataToRender || dataToRender.length === 0) {
        drinkColumn.innerHTML += '<p class="loading-message">No hay ítems en esta sección.</p>';
        eatColumn.innerHTML += '<p class="loading-message">No hay ítems en esta sección.</p>';
        return;
    }

    const drinkData = dataToRender.filter(item => DRINK_ME_CATEGORIES.has(item.categoria));
    const eatData = dataToRender.filter(item => EAT_ME_CATEGORIES.has(item.categoria));
    
    renderColumn(drinkData, drinkColumn);
    renderColumn(eatData, eatColumn);
    addAccordionFunctionality();
}

function renderColumn(data, columnElement) {
    const groupedData = {};
    data.forEach(item => {
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
    
    const filteredData = menuDataGlobal.map(item => {
        const filteredProductos = item.productos.filter(producto =>
            producto.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(lowerCaseSearchTerm))
        );
        if (filteredProductos.length > 0) {
            return { ...item, productos: filteredProductos };
        }
        return null;
    }).filter(item => item !== null);

    renderMenu(filteredData);
    
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

searchInput.addEventListener('input', (e) => {
    filterMenu(e.target.value);
});

document.addEventListener('DOMContentLoaded', fetchAndCacheMenu);