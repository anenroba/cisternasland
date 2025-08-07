const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('search-input');
const API_URL = 'https://api-swa.onrender.com/api/carta'; // URL de la API actualizada

let menuDataGlobal = []; // Almacenará los datos originales de la carta

// Función para obtener los datos de la carta
async function fetchMenu() {
    menuContainer.innerHTML = '<p class="loading-message">Cargando carta...</p>';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        menuDataGlobal = await response.json();
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
        // Contenedor de la categoría
        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');
        categoryHeader.innerHTML = `
            <h3>${categoria.categoria}</h3>
            <i class="fas fa-chevron-down"></i>
        `;
        menuContainer.appendChild(categoryHeader);

        // Contenedor de subcategorías (oculto por defecto)
        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.classList.add('subcategories-container');
        menuContainer.appendChild(subcategoriesContainer);

        categoria.productos.forEach(subcategoria => {
            // Contenedor de la subcategoría
            const subcategoryHeader = document.createElement('div');
            subcategoryHeader.classList.add('subcategory-header');
            subcategoryHeader.innerHTML = `
                <h4>${subcategoria.nombre}</h4>
                <i class="fas fa-chevron-down"></i>
            `;
            subcategoriesContainer.appendChild(subcategoryHeader);

            // Contenedor de productos (oculto por defecto)
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

    // Agregar la funcionalidad de acordeón
    addAccordionFunctionality();
}

// Función para agregar la funcionalidad de acordeón a las categorías y subcategorías
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

// Función para filtrar los productos por el término de búsqueda
function filterMenu(searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Filtra los datos globales
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
    // Expandir las categorías y subcategorías si se está buscando
    if (searchTerm) {
        document.querySelectorAll('.category-header, .subcategory-header').forEach(header => {
            header.classList.add('active');
            header.nextElementSibling.style.maxHeight = header.nextElementSibling.scrollHeight + 'px';
        });
    }
}

// Evento de escucha para la barra de búsqueda
searchInput.addEventListener('input', (e) => {
    filterMenu(e.target.value);
});

// Iniciar la carga de la carta
document.addEventListener('DOMContentLoaded', fetchMenu);