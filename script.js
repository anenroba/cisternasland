// --- CONFIGURACIÓN ---
const API_URL = 'https://api-swa.onrender.com/api/carta';
const DRINK_CATEGORIES = ["Botellas", "Cervezas", "Coctelería", "Degustaciones", "Gin", "Licores", "Pisco", "Ron", "Sin alcohol", "Tequila", "Vinos & Espumantes", "Vodka", "Whisky"];
const FOOD_CATEGORIES = ["Para comenzar", "Para compartir", "Pizzas", "Sushi Especial", "Dulce Final"];

// --- VARIABLES GLOBALES ---
let menuObserver;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', main);

async function main() {
    setupTheme();
    setupTableNumber();
    menuObserver = createIntersectionObserver();
    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.classList.remove('hidden');

    try {
        const rawData = await fetchData();
        const menuData = transformData(rawData);
        
        setupEventListeners(menuData);
        handleGroupClick('Drink', menuData);

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

// --- MANEJO DE EVENTOS Y UI ---
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

function renderSubCategoryButtons(subCategories) {
    const container = document.getElementById('sub-category-container');
    container.innerHTML = '';
    Object.entries(subCategories).forEach(([subCategoryName, subCategoryData]) => {
        const button = document.createElement('button');
        button.className = 'subcategory-btn'; 
        button.textContent = subCategoryData.name;
        button.dataset.target = `section-${subCategoryName.replace(/\s+/g, '-')}`;

        button.addEventListener('click', (e) => {
            container.querySelectorAll('.subcategory-btn.active').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const targetElement = document.getElementById(e.currentTarget.dataset.target);
            if(targetElement) {
                const offset = 160; 
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
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
        grid.className = 'grid grid-cols-1 gap-4';
        subCategoryData.items.forEach(item => {
            const price = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precio);
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-darkCard rounded-lg shadow p-4 border border-lightBorder dark:border-darkBorder';
            
            // CORRECCIÓN: Se vuelve a usar escapeHtml para seguridad
            card.innerHTML = `
                <h3 class="text-lg font-semibold text-lightText dark:text-darkText">${escapeHtml(item.nombre)}</h3>
                ${item.descripcion ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${escapeHtml(item.descripcion)}</p>` : ''}
                <p class="font-bold text-base mt-2 text-lightAccent dark:text-darkAccent">${price}</p>
            `;
            grid.appendChild(card);
        });
        section.appendChild(grid);
        container.appendChild(section);
        menuObserver.observe(section);
    });
}

// --- UTILIDADES ---

// CORRECCIÓN: Se reintroduce la función de seguridad
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createIntersectionObserver() {
    const observerOptions = {
        rootMargin: '-160px 0px -50% 0px',
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

function setupTableNumber() {
    const tableNumberSpan = document.getElementById('table-number');
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tableNumber = urlParams.get('mesa');
        if (tableNumber && tableNumberSpan) {
            tableNumberSpan.textContent = escapeHtml(tableNumber); // También se escapa por seguridad
        }
    } catch (error) {
        console.warn("No se pudo leer el número de mesa de la URL.");
        if (tableNumberSpan) {
            tableNumberSpan.textContent = '--';
        }
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