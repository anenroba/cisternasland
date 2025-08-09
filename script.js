// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DATOS DEL MENÚ (Ejemplo) ---
    // Puedes reemplazar esto con datos de una API
    const menuData = {
        food: [
            {
                subcategory: 'Entradas',
                items: [
                    { name: 'Ceviche Clásico', price: '$9.990' },
                    { name: 'Empanadas de Pino (3 un.)', price: '$7.500' },
                    { name: 'Tabla de Quesos y Fiambres', price: '$12.990' },
                ]
            },
            {
                subcategory: 'Principales',
                items: [
                    { name: 'Lomo Saltado', price: '$14.500' },
                    { name: 'Salmón a la Mantequilla', price: '$15.990' },
                    { name: 'Risotto de Champiñones', price: '$13.800' },
                    { name: 'Pastel de Choclo', price: '$11.990' },
                ]
            },
            {
                subcategory: 'Postres',
                items: [
                    { name: 'Torta Tres Leches', price: '$5.500' },
                    { name: 'Mote con Huesillo', price: '$4.000' },
                    { name: 'Volcán de Chocolate', price: '$6.200' },
                ]
            }
        ],
        drinks: [
            {
                subcategory: 'Bebidas',
                items: [
                    { name: 'Coca-Cola / Zero / Light', price: '$2.500' },
                    { name: 'Jugo Natural (Frutilla/Mango)', price: '$3.800' },
                    { name: 'Agua Mineral con/sin gas', price: '$2.000' },
                ]
            },
            {
                subcategory: 'Cervezas',
                items: [
                    { name: 'Kunstmann Torobayo', price: '$4.500' },
                    { name: 'Austral Calafate', price: '$4.800' },
                    { name: 'Corona', price: '$4.000' },
                ]
            },
            {
                subcategory: 'Vinos',
                items: [
                    { name: 'Copa Carmenere Reserva', price: '$5.000' },
                    { name: 'Copa Sauvignon Blanc', price: '$5.000' },
                ]
            }
        ]
    };

    // --- ELEMENTOS DEL DOM ---
    const themeToggle = document.getElementById('theme-toggle');
    const tableInfo = document.getElementById('table-info');
    const mainCategoriesContainer = document.getElementById('main-categories');
    const subCategoriesContainer = document.getElementById('sub-categories');
    const productListContainer = document.getElementById('product-list');

    let currentCategory = 'food';
    let currentSubcategory = menuData.food[0].subcategory;

    // --- FUNCIONES ---

    // 1. Obtener número de mesa de la URL
    const getTableNumber = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tableNumber = urlParams.get('mesa');
        if (tableNumber) {
            tableInfo.textContent = `Mesa: ${tableNumber}`;
        }
    };

    // 2. Manejar el cambio de tema (claro/oscuro)
    const setupThemeToggle = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');

        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    };

    // 3. Mostrar productos de una subcategoría
    const displayProducts = (category, subcategoryName) => {
        const subcategory = menuData[category].find(sub => sub.subcategory === subcategoryName);
        productListContainer.innerHTML = ''; // Limpiar lista actual

        if (!subcategory) return;

        subcategory.items.forEach(item => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <span class="product-name">${item.name}</span>
                <span class="product-price">${item.price}</span>
            `;
            productListContainer.appendChild(productElement);
        });
    };

    // 4. Mostrar las subcategorías de una categoría principal
    const displaySubcategories = (category) => {
        subCategoriesContainer.innerHTML = ''; // Limpiar subcategorías actuales
        const subcategories = menuData[category];

        subcategories.forEach((sub, index) => {
            const subcatButton = document.createElement('button');
            subcatButton.className = 'subcategory-btn';
            subcatButton.textContent = sub.subcategory;
            subcatButton.dataset.subcategory = sub.subcategory;

            subcatButton.addEventListener('click', () => {
                currentSubcategory = sub.subcategory;
                updateActiveStates();
                displayProducts(currentCategory, currentSubcategory);
            });

            subCategoriesContainer.appendChild(subcatButton);
        });

        // Seleccionar la primera subcategoría por defecto
        currentSubcategory = subcategories[0].subcategory;
        displayProducts(category, currentSubcategory);
        updateActiveStates();
    };
    
    // 5. Actualizar los estados "activos" de los botones
    const updateActiveStates = () => {
        // Categorías principales
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === currentCategory);
        });
        // Subcategorías
        document.querySelectorAll('.subcategory-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.subcategory === currentSubcategory);
        });
    };

    // 6. Configurar los botones de categoría principal
    const setupMainCategories = () => {
        mainCategoriesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                const category = e.target.dataset.category;
                if (category !== currentCategory) {
                    currentCategory = category;
                    displaySubcategories(currentCategory);
                }
            }
        });
    };

    // --- INICIALIZACIÓN ---
    const init = () => {
        getTableNumber();
        setupThemeToggle();
        setupMainCategories();
        // Carga inicial de la categoría "Food"
        displaySubcategories('food');
    };

    init();
});
