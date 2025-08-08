// --- CONFIGURACIÓN ---
const API_URL = 'https://api-swa.onrender.com/api/carta';
const DRINK_CATEGORIES = ["Botellas", "Cervezas", "Coctelería", "Degustaciones", "Gin", "Licores", "Pisco", "Ron", "Sin alcohol", "Tequila", "Vinos & Espumantes", "Vodka", "Whisky"];
const FOOD_CATEGORIES = ["Para comenzar", "Para compartir", "Pizzas", "Sushi Especial", "Dulce Final"];

// --- VARIABLES GLOBALES ---
let menuObserver; // Se declara aquí para que sea persistente

// Configuración de Tailwind
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
document.addEventListener('DOMContentLoaded', main);

async function main() {
    setupTheme();
    menuObserver = createIntersectionObserver(); // Se inicializa el observer una sola vez
    const loadingMessage = document.getElementById('loading-message');
    
    try {
        const rawData = await fetchData();
        const menuData = transformData(rawData);
        loadingMessage.style.display = 'none';
        renderUI(menuData);
    } catch (error) {
        console.error("Error al cargar el menú:", error);
        loadingMessage.textContent = 'No se pudo cargar el menú. Por favor, intente más tarde.';
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
        const { categoria, subcategoria, productos } = item;
        if (!structuredMenu[categoria]) structuredMenu[categoria] = {};
        const uniqueSubCategoryName = `${categoria} - ${subcategoria}`;
        structuredMenu[categoria][uniqueSubCategoryName] = { name: subcategoria, items: productos };
    }
    return structuredMenu;
}

// --- RENDERIZADO DE LA UI ---
function renderUI(menuData) {
    const drinkBtn = document.getElementById('drink-btn');
    const foodBtn = document.getElementById('food-btn');

    drinkBtn.addEventListener('click', () => handleGroupClick('Drink', menuData));
    foodBtn.addEventListener('click', () => handleGroupClick('Food', menuData));

    handleGroupClick('Drink', menuData); // Cargar vista por defecto
}

function handleGroupClick(groupName, allMenuData) {
    document.querySelectorAll('.group-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id.startsWith(groupName.toLowerCase()));
    });
    
    const targetCategories = groupName === 'Drink' ? DRINK_CATEGORIES : FOOD_CATEGORIES;
    const consolidatedSubcategories = {};

    for (const category of targetCategories) {
        if (allMenuData[category]) {
            Object.assign(consolidatedSubcategories, allMenuData[category]);
        }
    }

    renderSubCategoryButtons(consolidatedSubcategories);
    renderMenuItems(consolidatedSubcategories);

    const firstSubCategoryBtn = document.querySelector('.sub-category-btn');
    if (firstSubCategoryBtn) firstSubCategoryBtn.classList.add('active');
}

function renderSubCategoryButtons(subCategories) {
    const subCategoryNav = document.getElementById('sub-category-nav');
    subCategoryNav.innerHTML = '';

    Object.entries(subCategories).forEach(([uniqueSubCategoryName, subCategoryData]) => {
        const button = document.createElement('button');
        button.className = 'sub-category-btn whitespace-nowrap flex-shrink-0 py-2 px-4 rounded-lg text-sm font-medium hover:bg-lightAccent hover:text-white dark:hover:bg-darkAccent transition-all duration-200 focus:outline-none';
        button.textContent = subCategoryData.name;
        button.dataset.subCategory = uniqueSubCategoryName;

        button.addEventListener('click', () => {
            document.querySelectorAll('.sub-category-btn.active').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            const targetSection = document.getElementById(`section-${uniqueSubCategoryName}`);
            if (targetSection) {
                const offset = 160;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
        subCategoryNav.appendChild(button);
    });
}

function renderMenuItems(subCategories) {
    const menuItemsContainer = document.getElementById('menu-items-container');
    menuObserver.disconnect();
    menuItemsContainer.innerHTML = '';

    Object.entries(subCategories).forEach(([uniqueSubCategoryName, subCategoryData]) => {
        const section = document.createElement('section');
        section.id = `section-${uniqueSubCategoryName}`;
        section.className = 'pt-6 pb-4';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4 px-2';
        title.textContent = subCategoryData.name;
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
        menuObserver.observe(section);
    });
}

// --- UTILIDADES ---
function createIntersectionObserver() {
    const observerOptions = {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0
    };

    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const uniqueSubCategoryName = entry.target.id.replace('section-', '');
                const subCategoryBtn = document.querySelector(`.sub-category-btn[data-sub-category="${uniqueSubCategoryName}"]`);
                
                if (subCategoryBtn) {
                    document.querySelectorAll('.sub-category-btn.active').forEach(b => b.classList.remove('active'));
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