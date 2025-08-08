// --- CONFIGURACIÓN ---
const API_URL = 'https://api-swa.onrender.com/api/carta';
// Definición de qué categorías de la API corresponden a cada grupo.
const DRINK_CATEGORIES = ["Botellas", "Cervezas", "Coctelería", "Degustaciones", "Gin", "Licores", "Pisco", "Ron", "Sin alcohol", "Tequila", "Vinos & Espumantes", "Vodka", "Whisky"];
const FOOD_CATEGORIES = ["Para comenzar", "Para compartir", "Pizzas", "Sushi Especial", "Dulce Final"];


// Configuración de Tailwind para colores y fuentes personalizados
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: { inter: ['Inter', 'sans-serif'] },
            colors: {
                lightBg: '#fdfaf6', lightCard: '#ffffff', lightText: '#4a3d3c', lightAccent: '#b87333', lightBorder: '#e0c9b0',
                darkBg: '#2a1a16', darkCard: '#3e2d29', darkText: '#f5e8da', darkAccent: '#e49b5c', darkBorder: '#5c4541',
            }
        }
    }
};

// --- LÓGICA DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la aplicación
    main();
});

async function main() {
    setupTheme();

    const loadingMessage = document.getElementById('loading-message');
    
    try {
        const rawData = await fetchData();
        const menuData = transformData(rawData);
        
        loadingMessage.style.display = 'none'; // Ocultar mensaje de carga

        renderUI(menuData);
    } catch (error) {
        console.error("Error al cargar el menú:", error);
        loadingMessage.textContent = 'No se pudo cargar el menú. Por favor, intente más tarde.';
    }
}

// --- MANEJO DE DATOS ---

/**
 * Obtiene los datos del menú, primero desde localStorage, y si no, desde la API.
 */
async function fetchData() {
    const cachedMenu = localStorage.getItem('menuData');
    if (cachedMenu) {
        console.log("Cargando menú desde localStorage...");
        return JSON.parse(cachedMenu);
    }
    
    console.log("Cargando menú desde la API...");
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`Error de red: ${response.statusText}`);
    }
    const data = await response.json();
    localStorage.setItem('menuData', JSON.stringify(data)); // Guardar en caché
    return data;
}

/**
 * Transforma el array plano de la API a una estructura anidada que la UI puede usar.
 * Ej: { "Coctelería": { "Mojitos": { name: "Mojitos", items: [...] } } }
 */
function transformData(apiData) {
    const structuredMenu = {};
    
    for (const item of apiData) {
        const { categoria, subcategoria, productos } = item;
        
        if (!structuredMenu[categoria]) {
            structuredMenu[categoria] = {};
        }

        // Crear un nombre único para la subcategoría para evitar colisiones
        const uniqueSubCategoryName = `${categoria} - ${subcategoria}`;
        structuredMenu[categoria][uniqueSubCategoryName] = {
            name: subcategoria,
            items: productos
        };
    }
    return structuredMenu;
}


// --- RENDERIZADO DE LA UI ---

/**
 * Orquesta el renderizado de toda la interfaz a partir de los datos del menú.
 */
function renderUI(menuData) {
    const drinkBtn = document.getElementById('drink-btn');
    const foodBtn = document.getElementById('food-btn');

    drinkBtn.addEventListener('click', () => handleGroupClick('Drink', menuData));
    foodBtn.addEventListener('click', () => handleGroupClick('Food', menuData));

    // Cargar "Drink" por defecto al iniciar
    handleGroupClick('Drink', menuData);
}

/**
 * Maneja el clic en un botón de grupo principal (Food o Drink).
 */
function handleGroupClick(groupName, allMenuData) {
    // Actualizar estilo del botón activo
    document.querySelectorAll('.group-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id.startsWith(groupName.toLowerCase()));
    });
    
    const targetCategories = groupName === 'Drink' ? DRINK_CATEGORIES : FOOD_CATEGORIES;
    const consolidatedSubcategories = {};

    // Recolectar todas las subcategorías del grupo seleccionado
    for (const category of targetCategories) {
        if (allMenuData[category]) {
            Object.assign(consolidatedSubcategories, allMenuData[category]);
        }
    }

    renderSubCategoryButtons(consolidatedSubcategories);
    renderMenuItems(consolidatedSubcategories);

    // Activar el primer botón de subcategoría por defecto
    const firstSubCategoryBtn = document.querySelector('.sub-category-btn');
    if (firstSubCategoryBtn) {
        firstSubCategoryBtn.classList.add('active');
    }
}

/**
 * Renderiza los botones de las subcategorías.
 */
function renderSubCategoryButtons(subCategories) {
    const subCategoryNav = document.getElementById('sub-category-nav');
    subCategoryNav.innerHTML = ''; // Limpiar anteriores

    Object.entries(subCategories).forEach(([uniqueSubCategoryName, subCategoryData]) => {
        const button = document.createElement('button');
        button.className = 'sub-category-btn whitespace-nowrap flex-shrink-0 py-2 px-4 rounded-lg text-sm font-medium hover:bg-lightAccent hover:text-white dark:hover:bg-darkAccent transition-all duration-200 focus:outline-none';
        button.textContent = subCategoryData.name; // Usar el nombre original para mostrar
        button.dataset.subCategory = uniqueSubCategoryName; // Usar el nombre único como identificador
        button.addEventListener('click', () => {
             // Lógica de scroll suave al hacer clic en un botón de subcategoría
            const targetSection = document.getElementById(`section-${uniqueSubCategoryName}`);
            if (targetSection) {
                const offset = 160; // Espacio para los encabezados fijos
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
        subCategoryNav.appendChild(button);
    });
}

/**
 * Renderiza todos los productos de un grupo de subcategorías.
 */
function renderMenuItems(subCategories) {
    const menuItemsContainer = document.getElementById('menu-items-container');
    menuItemsContainer.innerHTML = ''; // Limpiar anteriores

    // Crear un observer para resaltar la subcategoría activa al hacer scroll
    const observer = createIntersectionObserver();

    Object.entries(subCategories).forEach(([uniqueSubCategoryName, subCategoryData]) => {
        const section = document.createElement('section');
        section.id = `section-${uniqueSubCategoryName}`;
        section.className = 'pt-6 pb-4';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4 px-2';
        title.textContent = subCategoryData.name; // Mostrar el nombre original
        section.appendChild(title);

        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'space-y-4';
        
        subCategoryData.items.forEach(item => {
            const price = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precio);
            const itemHtml = `
                <div class="flex items-center bg-lightCard dark:bg-darkCard rounded-xl shadow-sm overflow-hidden p-3 transition-transform duration-200 hover:scale-[1.01] border border-lightBorder dark:border-darkBorder">
                    <div class="flex-grow">
                        <h3 class="text-lg sm:text-xl font-semibold mb-1">${item.nombre}</h3>
                        ${item.descripcion ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${item.descripcion}</p>` : ''}
                        <p class="text-lightAccent dark:text-darkAccent font-bold text-base sm:text-lg">${price}</p>
                    </div>
                </div>
            `;
            itemsGrid.innerHTML += itemHtml;
        });

        section.appendChild(itemsGrid);
        menuItemsContainer.appendChild(section);
        observer.observe(section); // Poner la nueva sección bajo vigilancia del observer
    });
}


// --- UTILIDADES ---

/**
 * Crea un IntersectionObserver para actualizar la subcategoría activa al hacer scroll.
 */
function createIntersectionObserver() {
    const observerOptions = {
        rootMargin: '-40% 0px -60% 0px', // Activa cuando la sección está en el 40% superior de la pantalla
        threshold: 0
    };

    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const uniqueSubCategoryName = entry.target.id.replace('section-', '');
            const subCategoryBtn = document.querySelector(`.sub-category-btn[data-sub-category="${uniqueSubCategoryName}"]`);
            if (subCategoryBtn) {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.sub-category-btn.active').forEach(b => b.classList.remove('active'));
                    subCategoryBtn.classList.add('active');
                    // Hacer scroll horizontal para que el botón activo sea visible en el menú
                    subCategoryBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        });
    }, observerOptions);
}

/**
 * Configura el cambio de tema (claro/oscuro).
 */
function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-light-icon');
    const darkIcon = document.getElementById('theme-dark-icon');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'dark'; // Oscuro por defecto
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}