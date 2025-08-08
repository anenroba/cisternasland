// --- CONFIGURACIÓN ---
const API_URL = 'https://api-swa.onrender.com/api/carta';
const DRINK_CATEGORIES = ["Botellas", "Cervezas", "Coctelería", "Degustaciones", "Gin", "Licores", "Pisco", "Ron", "Sin alcohol", "Tequila", "Vinos & Espumantes", "Vodka", "Whisky"];
const FOOD_CATEGORIES = ["Para comenzar", "Para compartir", "Pizzas", "Sushi Especial", "Dulce Final"];

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', main);

async function main() {
    setupTheme();
    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.classList.remove('hidden');

    try {
        const rawData = await fetchData();
        const menuData = transformData(rawData);
        
        populateAllMenus(menuData);
        setupEventListeners(menuData);

        // Mostrar la sección de bebidas por defecto
        showSection('drink');
    } catch (error) {
        console.error("Error fatal al cargar el menú:", error);
        document.querySelector('main').innerHTML = '<p class="text-center text-red-500">No se pudo cargar el menú. Por favor, intente de nuevo más tarde.</p>';
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

// --- MANEJO DE DATOS ---
async function fetchData() {
    const cachedMenu = localStorage.getItem('menuData');
    if (cachedMenu) return JSON.parse(cachedMenu);
    
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
    const data = await response.json();
    localStorage.setItem('menuData', JSON.stringify(data));
    return data;
}

function transformData(apiData) {
    const structuredMenu = {};
    for (const item of apiData) {
        if (!structuredMenu[item.categoria]) {
            structuredMenu[item.categoria] = {};
        }
        structuredMenu[item.categoria][item.subcategoria] = { name: item.subcategoria, items: item.productos };
    }
    return structuredMenu;
}

// --- RENDERIZADO INICIAL ---
function populateAllMenus(menuData) {
    // Poblar sección de bebidas
    const drinkSubcategories = getConsolidatedSubcategories('Drink', menuData);
    renderSubCategoryButtons(drinkSubcategories, document.getElementById('drink-nav-container'));
    renderMenuItems(drinkSubcategories, document.getElementById('drink-menu-container'));
    
    // Poblar sección de comida
    const foodSubcategories = getConsolidatedSubcategories('Food', menuData);
    renderSubCategoryButtons(foodSubcategories, document.getElementById('food-nav-container'));
    renderMenuItems(foodSubcategories, document.getElementById('food-menu-container'));
}

function getConsolidatedSubcategories(groupName, allMenuData) {
    const targetCategories = groupName === 'Drink' ? DRINK_CATEGORIES : FOOD_CATEGORIES;
    const consolidated = {};
    for (const category of targetCategories) {
        if (allMenuData[category]) {
            Object.assign(consolidated, allMenuData[category]);
        }
    }
    return consolidated;
}

function renderSubCategoryButtons(subCategories, container) {
    container.innerHTML = ''; // Limpiar
    Object.entries(subCategories).forEach(([subCategoryName, subCategoryData]) => {
        const button = document.createElement('button');
        button.className = 'subcategory-btn px-4 py-2 rounded-full text-sm font-medium bg-lightCard dark:bg-darkCard hover:bg-lightAccent hover:text-white dark:hover:bg-darkAccent transition-all duration-200';
        button.textContent = subCategoryData.name;
        button.dataset.target = `section-${subCategoryName.replace(/\s+/g, '-')}`;
        
        button.addEventListener('click', (e) => {
            container.querySelectorAll('.subcategory-btn').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const targetElement = document.getElementById(e.currentTarget.dataset.target);
            if(targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        container.appendChild(button);
    });
}

function renderMenuItems(subCategories, container) {
    container.innerHTML = ''; // Limpiar
    Object.entries(subCategories).forEach(([subCategoryName, subCategoryData]) => {
        // Crear un ancla para el scroll
        const anchor = document.createElement('div');
        anchor.id = `section-${subCategoryName.replace(/\s+/g, '-')}`;
        anchor.className = 'scroll-mt-40'; // Margen superior para el scroll
        container.appendChild(anchor);

        // Crear el título de la sección
        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4 col-span-1 md:col-span-2';
        title.textContent = subCategoryData.name;
        container.appendChild(title);

        // Renderizar los productos
        subCategoryData.items.forEach(item => {
            const price = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precio);
            const card = document.createElement('div');
            card.className = 'bg-lightCard dark:bg-darkCard rounded-lg shadow p-4 border border-lightBorder dark:border-darkBorder';
            card.innerHTML = `
                <h3 class="text-lg font-semibold text-lightText dark:text-darkText">${item.nombre}</h3>
                ${item.descripcion ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${item.descripcion}</p>` : ''}
                <p class="text-lightAccent dark:text-darkAccent font-bold text-base mt-2">${price}</p>
            `;
            container.appendChild(card);
        });
    });
}

// --- MANEJO DE EVENTOS ---
function setupEventListeners() {
    document.getElementById('drink-btn').addEventListener('click', () => showSection('drink'));
    document.getElementById('food-btn').addEventListener('click', () => showSection('food'));
    
    // Listener de scroll para resaltar subcategorías (opcional, más simple)
    // El resaltado por click ya da buena respuesta visual.
}

function showSection(sectionName) {
    const drinkSection = document.getElementById('drink-section');
    const foodSection = document.getElementById('food-section');
    const drinkBtn = document.getElementById('drink-btn');
    const foodBtn = document.getElementById('food-btn');

    if (sectionName === 'drink') {
        drinkSection.classList.remove('hidden');
        foodSection.classList.add('hidden');
        drinkBtn.classList.add('active');
        foodBtn.classList.remove('active');
    } else {
        drinkSection.classList.add('hidden');
        foodSection.classList.remove('hidden');
        drinkBtn.classList.remove('active');
        foodBtn.classList.add('active');
    }
}

function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-light-icon');
    const darkIcon = document.getElementById('theme-dark-icon');

    const applyTheme = (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        lightIcon.classList.toggle('hidden', theme === 'dark');
        darkIcon.classList.toggle('hidden', theme !== 'dark');
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}