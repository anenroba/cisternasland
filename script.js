// --- CONFIGURACIÓN ---
const API_URL = 'https://api-swa.onrender.com/api/carta';
const DRINK_CATEGORIES = ["Botellas", "Cervezas", "Coctelería", "Degustaciones", "Gin", "Licores", "Pisco", "Ron", "Sin alcohol", "Tequila", "Vinos & Espumantes", "Vodka", "Whisky"];
const FOOD_CATEGORIES = ["Para comenzar", "Para compartir", "Pizzas", "Sushi Especial", "Dulce Final"];

// --- VARIABLES GLOBALES ---
let menuObserver;

// --- LÓGICA DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', main);

async function main() {
    setupTheme();
    menuObserver = createIntersectionObserver();
    
    try {
        showLoading(true);
        const rawData = await fetchData();
        const menuData = transformData(rawData);
        showLoading(false);
        renderUI(menuData);
    } catch (error) {
        console.error("Error al cargar el menú:", error);
        showLoading(false);
        showError('No se pudo cargar el menú. Por favor, intente más tarde.');
    }
}

// --- MANEJO DE DATOS ---
async function fetchData() {
    // Nota: localStorage no está disponible en Claude.ai artifacts
    // En un entorno real, descomenta las siguientes líneas:
    // const cachedMenu = localStorage.getItem('menuData');
    // if (cachedMenu) return JSON.parse(cachedMenu);
    
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
    const data = await response.json();
    
    // En un entorno real, descomenta la siguiente línea:
    // localStorage.setItem('menuData', JSON.stringify(data));
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

    if (drinkBtn && foodBtn) {
        drinkBtn.addEventListener('click', () => handleGroupClick('Drink', menuData));
        foodBtn.addEventListener('click', () => handleGroupClick('Food', menuData));

        // Cargar vista por defecto (Drink)
        handleGroupClick('Drink', menuData);
    } else {
        console.error('No se encontraron los botones principales del menú');
    }
}

function handleGroupClick(groupName, allMenuData) {
    // Actualizar botones principales activos
    document.querySelectorAll('.main-category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `${groupName.toLowerCase()}-btn`);
    });
    
    // Mostrar/ocultar secciones correspondientes
    const drinkSection = document.getElementById('drink-section');
    const foodSection = document.getElementById('food-section');
    
    if (drinkSection && foodSection) {
        if (groupName === 'Drink') {
            drinkSection.classList.remove('hidden');
            foodSection.classList.add('hidden');
        } else {
            foodSection.classList.remove('hidden');
            drinkSection.classList.add('hidden');
        }
    }
    
    const targetCategories = groupName === 'Drink' ? DRINK_CATEGORIES : FOOD_CATEGORIES;
    const consolidatedSubcategories = {};

    for (const category of targetCategories) {
        if (allMenuData[category]) {
            Object.assign(consolidatedSubcategories, allMenuData[category]);
        }
    }

    const targetMenuContainer = groupName === 'Drink' ? 'drink-menu' : 'food-menu';
    const targetNavContainer = groupName === 'Drink' ? 'drink-nav' : 'food-nav';
    
    renderSubCategoryButtons(consolidatedSubcategories, targetNavContainer);
    renderMenuItems(consolidatedSubcategories, targetMenuContainer);

    // Activar primer botón de subcategoría
    const firstSubCategoryBtn = document.querySelector(`#${targetNavContainer} .subcategory-btn`);
    if (firstSubCategoryBtn) {
        firstSubCategoryBtn.classList.add('active');
    }
}

function renderSubCategoryButtons(subCategories, navContainerId) {
    const subCategoryNav = document.querySelector(`#${navContainerId} > div`);
    if (!subCategoryNav) {
        console.error(`No se encontró el contenedor de navegación: ${navContainerId}`);
        return;
    }
    
    subCategoryNav.innerHTML = '';

    Object.entries(subCategories).forEach(([uniqueSubCategoryName, subCategoryData]) => {
        const button = document.createElement('button');
        button.className = 'subcategory-btn px-4 py-2 rounded-full text-sm font-medium bg-lightCard dark:bg-darkCard hover:bg-lightAccent hover:text-white dark:hover:bg-darkAccent transition-all duration-200';
        button.textContent = subCategoryData.name;
        button.dataset.category = uniqueSubCategoryName;

        button.addEventListener('click', () => {
            // Remover clase activa de otros botones en el mismo nav
            subCategoryNav.querySelectorAll('.subcategory-btn.active').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            const targetSection = document.getElementById(`section-${uniqueSubCategoryName}`);
            if (targetSection) {
                const offset = 200;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
        
        subCategoryNav.appendChild(button);
    });
}

function renderMenuItems(subCategories, menuContainerId) {
    const menuItemsContainer = document.getElementById(menuContainerId);
    if (!menuItemsContainer) {
        console.error(`No se encontró el contenedor del menú: ${menuContainerId}`);
        return;
    }
    
    menuObserver.disconnect();
    menuItemsContainer.innerHTML = '';

    Object.entries(subCategories).forEach(([uniqueSubCategoryName, subCategoryData]) => {
        const section = document.createElement('section');
        section.id = `section-${uniqueSubCategoryName}`;
        section.className = 'mb-8';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-6 text-lightText dark:text-darkText';
        title.textContent = subCategoryData.name;
        section.appendChild(title);

        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'grid gap-4';
        
        subCategoryData.items.forEach(item => {
            const price = new Intl.NumberFormat('es-CL', { 
                style: 'currency', 
                currency: 'CLP' 
            }).format(item.precio);
            
            const itemCard = document.createElement('div');
            itemCard.className = 'menu-item-card';
            
            itemCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-grow pr-4">
                        <h3 class="text-lg font-semibold text-lightText dark:text-darkText mb-1">
                            ${escapeHtml(item.nombre)}
                        </h3>
                        ${item.descripcion ? `
                            <p class="description">
                                ${escapeHtml(item.descripcion)}
                            </p>
                        ` : ''}
                    </div>
                    <div class="flex-shrink-0">
                        <span class="price">${price}</span>
                    </div>
                </div>
            `;
            
            itemsGrid.appendChild(itemCard);
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
                const subCategoryBtn = document.querySelector(`[data-category="${uniqueSubCategoryName}"]`);
                
                if (subCategoryBtn) {
                    // Remover activo de otros botones en el mismo contenedor
                    const navContainer = subCategoryBtn.closest('nav');
                    if (navContainer) {
                        navContainer.querySelectorAll('.subcategory-btn.active').forEach(b => b.classList.remove('active'));
                        subCategoryBtn.classList.add('active');
                        subCategoryBtn.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'nearest', 
                            inline: 'center' 
                        });
                    }
                }
            }
        });
    }, observerOptions);
}

function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-light-icon');
    const darkIcon = document.getElementById('theme-dark-icon');

    if (!themeToggle || !lightIcon || !darkIcon) {
        console.error('No se encontraron los elementos del tema');
        return;
    }

    const applyTheme = (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        lightIcon.classList.toggle('hidden', theme === 'dark');
        darkIcon.classList.toggle('hidden', theme !== 'dark');
    };

    // En un entorno real, usar localStorage:
    // const savedTheme = localStorage.getItem('theme') || 'light';
    const savedTheme = 'light'; // Default para Claude.ai artifacts
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        // En un entorno real, descomentar:
        // localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.classList.toggle('hidden', !show);
    }
}

function showError(message) {
    const menuContainers = document.querySelectorAll('#drink-menu, #food-menu');
    menuContainers.forEach(container => {
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600 dark:text-red-400 text-lg">${escapeHtml(message)}</p>
                    <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-lightAccent dark:bg-darkAccent text-white rounded-lg hover:opacity-80 transition-opacity">
                        Intentar de nuevo
                    </button>
                </div>
            `;
        }
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}