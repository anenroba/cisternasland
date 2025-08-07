const API_URL = 'https://api-swa.onrender.com/api/carta';
const LOCAL_STORAGE_KEY = 'cisternasMenuData';

const themeToggle = document.getElementById('theme-toggle');
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchCloseBtn = document.getElementById('search-close-btn');
const searchInput = document.getElementById('search-input');
const foodTabBtn = document.getElementById('food-tab');
const drinkTabBtn = document.getElementById('drink-tab');
const subcategoryBarElement = document.getElementById('subcategoryBar');
const contentSectionsContainer = document.getElementById('contentSections');
const headerElement = document.getElementById('header');
const mainTabsContainer = document.querySelector('.main-tabs-container');

let menuDataGlobal = [];
let activeMainTab = 'Food';
let activeSubcategory = '';

const DRINK_ME_CATEGORIES = ['Coctelería', 'Pisco', 'Whisky', 'Vinos & Espumantes', 'Gin', 'Vodka', 'Ron', 'Tequila', 'Cervezas', 'Licores', 'Sin alcohol', 'Botellas', 'Degustaciones'];
const EAT_ME_CATEGORIES = ['Para comenzar', 'Pizzas', 'Para compartir', 'Sushi Especial', 'Dulce Final'];

async function fetchAndCacheMenu() {
    contentSectionsContainer.innerHTML = '<p class="loading-message text-center p-4">Cargando carta...</p>';
    
    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedData) {
        menuDataGlobal = JSON.parse(cachedData);
        initializeMenu();
    } else {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            menuDataGlobal = data;
            initializeMenu();
        } catch (error) {
            console.error('Error al obtener la carta:', error);
            contentSectionsContainer.innerHTML = '<p class="loading-message text-center p-4 text-red-500">Error al cargar la carta. Por favor, inténtelo de nuevo más tarde.</p>';
        }
    }
}

function initializeMenu() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', savedTheme === 'dark');
    updateThemeIcon(savedTheme);

    switchMainTab('Food');
    setupEventListeners();
}

function switchMainTab(tab) {
    activeMainTab = tab;
    foodTabBtn.classList.toggle('active', tab === 'Food');
    drinkTabBtn.classList.toggle('active', tab === 'Drinks');
    
    renderSubcategoryMenu();
}

function renderSubcategoryMenu() {
    const categoriesToShow = activeMainTab === 'Food' ? EAT_ME_CATEGORIES : DRINK_ME_CATEGORIES;
    const availableCategories = menuDataGlobal.filter(item => categoriesToShow.includes(item.categoria));
    
    subcategoryBarElement.innerHTML = '';
    const uniqueSubcategories = [...new Set(availableCategories.map(item => item.subcategoria))];

    if (uniqueSubcategories.length > 0) {
        activeSubcategory = uniqueSubcategories[0];
    } else {
        activeSubcategory = '';
    }

    uniqueSubcategories.forEach((subcat, index) => {
        const link = document.createElement('a');
        link.href = `#section-${subcat.replace(/\s/g, '-')}`;
        link.className = `subcategory-button ${subcat === activeSubcategory ? 'active' : ''}`;
        link.textContent = subcat;
        link.dataset.subcategory = subcat;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = `section-${subcat.replace(/\s/g, '-')}`;
            const section = document.getElementById(sectionId);
            if(section) {
                const offset = headerElement.offsetHeight + mainTabsContainer.offsetHeight + subcategoryBarElement.offsetHeight;
                window.scrollTo({ top: section.offsetTop - offset, behavior: 'smooth' });
                setActiveSubcategory(subcat);
            }
        });
        
        subcategoryBarElement.appendChild(link);
    });
    
    renderProducts(availableCategories);
    updateScrollSync();
}

function setActiveSubcategory(subcat) {
    activeSubcategory = subcat;
    document.querySelectorAll('.subcategory-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subcategory === subcat);
    });
}

function renderProducts(dataToRender) {
    contentSectionsContainer.innerHTML = '';
    if (!dataToRender || dataToRender.length === 0) {
        contentSectionsContainer.innerHTML = '<p class="loading-message">No se encontraron productos.</p>';
        return;
    }
    
    const renderedSubcategories = new Set();
    dataToRender.forEach(item => {
        const subcategoryKey = item.subcategoria.replace(/\s/g, '-');
        if (!renderedSubcategories.has(subcategoryKey)) {
            const section = document.createElement('section');
            section.id = `section-${subcategoryKey}`;
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'text-2xl font-bold mb-4';
            title.textContent = item.subcategoria;
            section.appendChild(title);
            contentSectionsContainer.appendChild(section);
            renderedSubcategories.add(subcategoryKey);
        }

        const section = document.getElementById(`section-${subcategoryKey}`);
        item.productos.forEach(producto => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const placeholderColor = Math.abs(hashString(producto.nombre)) % 360;
            const imageUrl = producto.image_url ? producto.image_url : `https://dummyimage.com/80x80/2C2620/${placeholderColor.toString(16).padStart(2, '0')}.png&text=${encodeURIComponent(producto.nombre.split(' ')[0])}`;
            
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${producto.nombre}" class="product-image">
                <div class="product-details">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion || ''}</p>
                </div>
                <div class="product-price">${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(producto.precio)}</div>
            `;
            section.appendChild(productCard);
        });
    });
}

function updateScrollSync() {
    let lastActive = '';
    const headerHeight = headerElement.offsetHeight;
    const mainTabsHeight = mainTabsContainer.offsetHeight;
    const subcategoryBarWrapper = document.querySelector('.subcategory-bar-wrapper');
    const subcategoryBarHeight = subcategoryBarWrapper.offsetHeight;
    const offset = headerHeight + mainTabsHeight + subcategoryBarHeight + 10;

    const sections = document.querySelectorAll('.category-section');
    const subcategoryButtons = document.querySelectorAll('.subcategory-button');

    window.onscroll = () => {
        let currentSubcat = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= offset && rect.bottom > offset) {
                currentSubcat = section.id.replace('section-', '').replace(/-/g, ' ');
            }
        });

        if (currentSubcat && lastActive !== currentSubcat) {
            subcategoryButtons.forEach(btn => btn.classList.remove('active'));
            const buttonToActivate = document.querySelector(`.subcategory-button[data-subcategory="${currentSubcat}"]`);
            if (buttonToActivate) {
                buttonToActivate.classList.add('active');
                subcategoryBarElement.scrollTo({
                    left: buttonToActivate.offsetLeft - subcategoryBarElement.offsetLeft,
                    behavior: 'smooth'
                });
            }
            lastActive = currentSubcat;
        }
    };
}


function setupEventListeners() {
    foodTabBtn.addEventListener('click', () => switchMainTab('Food'));
    drinkTabBtn.addEventListener('click', () => switchMainTab('Drinks'));
    themeToggle.addEventListener('click', toggleTheme);

    searchToggle.addEventListener('click', () => {
        searchBar.classList.toggle('visible');
    });

    searchCloseBtn.addEventListener('click', () => {
        searchBar.classList.remove('visible');
        searchInput.value = '';
        searchMenu('');
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        searchMenu(searchTerm);
    });
}

function searchMenu(searchTerm) {
    const categoriesToShow = activeMainTab === 'Food' ? EAT_ME_CATEGORIES : DRINK_ME_CATEGORIES;
    const availableCategories = menuDataGlobal.filter(item => categoriesToShow.includes(item.categoria));

    const filteredData = availableCategories.map(item => {
        const filteredProducts = item.productos.filter(producto => 
            producto.nombre.toLowerCase().includes(searchTerm) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm))
        );
        return { ...item, productos: filteredProducts };
    }).filter(item => item.productos.length > 0);

    renderProducts(filteredData);
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

document.addEventListener('DOMContentLoaded', fetchAndCacheMenu);