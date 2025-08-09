// --- CONFIGURACIÓN ---
const API_URL = 'https://api-swa.onrender.com/api/carta';
const DRINK_CATEGORIES = ["Botellas", "Cervezas", "Coctelería", "Degustaciones", "Gin", "Licores", "Pisco", "Ron", "Sin alcohol", "Tequila", "Vinos & Espumantes", "Vodka", "Whisky"];
const FOOD_CATEGORIES = ["Para comenzar", "Para compartir", "Pizzas", "Sushi Especial", "Dulce Final"];

// --- VARIABLES GLOBALES ---
let menuObserver; // Observer para resaltar subcategoría activa en scroll

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', main);

async function main() {
    setupTheme();
    menuObserver = createIntersectionObserver();
    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.classList.remove('hidden');

    try {
        const rawData = await fetchData();
        const menuData = transformData(rawData);
        
        setupEventListeners(menuData);
        handleGroupClick('Drink', menuData); // Cargar "Drink" por defecto

    } catch (error) {
        console.error("Error fatal al cargar el menú:", error);
        document.getElementById('menu-items-container').innerHTML = `<p class="text-center text-red-500">No se pudo cargar el menú.</p>`;
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
        if (!structuredMenu[item.categoria]) structuredMenu[item.categoria] = {};
        structuredMenu[item.categoria][item.subcategoria] = { name: item.subcategoria, items: item.productos };
    }
    return structuredMenu;
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

// --- MANEJO DE EVENTOS ---
function setupEventListeners(menuData) {
    document.getElementById('drink-btn').addEventListener('click', () => handleGroupClick('Drink', menuData));
    document.getElementById('food-btn').addEventListener('click', () => handleGroupClick('Food', menuData));
}

function handleGroupClick(groupName, allMenuData) {
    document.querySelectorAll('.main-category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `${groupName.toLowerCase()}-btn`);
    });
    
    const subCategories = getConsolidatedSubcategories(groupName, allMenuData);
    renderSubCategoryButtons(subCategories);
    renderMenuItems(subCategories);
    
    const firstSubCategoryBtn = document.querySelector('.subcategory-btn');
    if (firstSubCategoryBtn) firstSubCategoryBtn.classList.add('active');
}

// --- RENDERIZADO ---
function renderSubCategoryButtons(subCategories) {
    const container = document.getElementById('sub-category-container');
    container.innerHTML = '';
    Object.entries(subCategories).forEach(([subCategoryName, subCategoryData]) => {
        const button = document.createElement('button');
        // El estilo base ahora está en el CSS, aquí solo la clase principal
        button.className = 'subcategory-btn'; 
        button.textContent = subCategoryData.name;
        button.dataset.target = `section-${subCategoryName.replace(/\s+/g, '-')}`;

        button.addEventListener('click', (e) => {
            const targetElement = document.getElementById(e.currentTarget.dataset.target);
            if(targetElement) {
                const offset = 150; 
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetElement.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
        container.appendChild(button);
    });
}

function renderMenuItems(subCategories) {
    const container = document.getElementById('menu-items-container');
    menuObserver.disconnect();
    container.innerHTML = '';

    Object.entries(subCategories).forEach(([subCategoryName, subCategoryData]) => {
        const section = document.createElement('section');
        section.id = `section-${subCategoryName.replace(/\s+/g, '-')}`;
        section.className = 'scroll-mt-40 pt-6';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4';
        title.textContent = subCategoryData.name;
        section.appendChild(title);
        
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
        subCategoryData.items.forEach(item => {
            const price = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precio);
            const card = document.createElement('div');
            card.className = 'bg-lightCard dark:bg-darkCard rounded-lg shadow p-4 border border-lightBorder dark:border-darkBorder';
            card.innerHTML = `
                <h3 class="text-lg font-semibold text-lightText dark:text-darkText">${item.nombre}</h3>
                ${item.descripcion ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${item.descripcion}</p>` : ''}
                <p class="text-lightAccent dark:text-darkAccent font-bold text-base mt-2">${price}</p>
            `;
            grid.appendChild(card);
        });
        section.appendChild(grid);
        container.appendChild(section);
        menuObserver.observe(section);
    });
}

// --- UTILIDADES ---
function createIntersectionObserver() {
    const observerOptions = {
        rootMargin: '-150px 0px -50% 0px',
        threshold: 0
    };

    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                const subCategoryBtn = document.querySelector(`.subcategory-btn[data-target="${targetId}"]`);
                
                document.querySelectorAll('.subcategory-btn.active').forEach(b => b.classList.remove('active'));
                if (subCategoryBtn) {
                    subCategoryBtn.classList.add('active');
                    subCategoryBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        });
    }, observerOptions);
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