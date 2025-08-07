const API_URL = 'https://api-swa.onrender.com/api/carta';
const LOCAL_STORAGE_KEY = 'cisternasMenuData';

const themeToggle = document.getElementById('theme-toggle');
const foodTabBtn = document.getElementById('food-tab');
const drinkTabBtn = document.getElementById('drink-tab');
const subcategoryBarElement = document.getElementById('subcategoryBar');
const contentSectionsContainer = document.getElementById('contentSections');

let menuDataGlobal = [];
let activeMainTab = 'Food';
let activeSubcategory = '';

const DRINK_ME_CATEGORIES = new Set(['Coctelería', 'Pisco', 'Whisky', 'Vinos & Espumantes', 'Gin', 'Vodka', 'Ron', 'Tequila', 'Cervezas', 'Licores', 'Sin alcohol', 'Botellas', 'Degustaciones']);
const EAT_ME_CATEGORIES = new Set(['Para comenzar', 'Pizzas', 'Para compartir', 'Sushi Especial', 'Dulce Final']);

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
}

function switchMainTab(tab) {
    activeMainTab = tab;
    foodTabBtn.classList.toggle('active', tab === 'Food');
    drinkTabBtn.classList.toggle('active', tab === 'Drinks');
    
    renderSubcategoryMenu();
}

function renderSubcategoryMenu() {
    subcategoryBarElement.innerHTML = '';
    const categoriesToShow = activeMainTab === 'Food' ? EAT_ME_CATEGORIES : DRINK_ME_CATEGORIES;
    const availableCategories = menuDataGlobal.filter(item => categoriesToShow.has(item.categoria));
    
    const uniqueSubcategories = [...new Set(availableCategories.map(item => item.subcategoria))];

    if (uniqueSubcategories.length > 0) {
        activeSubcategory = activeSubcategory || uniqueSubcategories[0];
    } else {
        activeSubcategory = '';
    }

    const subcategoryElements = {};
    uniqueSubcategories.forEach((subcat, index) => {
        const button = document.createElement('button');
        button.className = `subcategory-button ${subcat === activeSubcategory ? 'active' : ''}`;
        button.textContent = subcat;
        button.dataset.subcategory = subcat;
        button.addEventListener('click', () => {
            setActiveSubcategory(subcat);
            const sectionId = `section-${subcat.replace(/\s/g, '-')}`;
            const section = document.getElementById(sectionId);
            if(section) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const mainTabsHeight = document.getElementById('mainTabs').offsetHeight;
                const subcategoryBarHeight = document.getElementById('subcategoryBar').offsetHeight;
                const offset = headerHeight + mainTabsHeight + subcategoryBarHeight;
                window.scrollTo({ top: section.offsetTop - offset, behavior: 'smooth' });
            }
        });
        subcategoryBarElement.appendChild(button);
        subcategoryElements[subcat] = button;
    });

    renderProducts(availableCategories);
    addScrollSync(subcategoryElements);
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
            
            // Reemplazar la imagen por un placeholder o la imagen real
            const imageHtml = producto.image_url 
                ? `<img src="${producto.image_url}" alt="${producto.nombre}" class="product-image">`
                : `<div class="product-image"><i class="fas fa-camera product-image-placeholder"></i></div>`;

            productCard.innerHTML = `
                ${imageHtml}
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

function addScrollSync(subcategoryButtons) {
    let scrollTimeout;
    const headerHeight = document.getElementById('header').offsetHeight;
    const mainTabsHeight = document.getElementById('mainTabs').offsetHeight;
    const subcategoryBarHeight = document.getElementById('subcategoryBar').offsetHeight;
    const offset = headerHeight + mainTabsHeight + subcategoryBarHeight + 20;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPosition = window.scrollY;
            let currentSubcat = '';
            
            const sections = document.querySelectorAll('.category-section');
            sections.forEach(section => {
                if (scrollPosition >= section.offsetTop - offset) {
                    currentSubcat = section.id.replace('section-', '').replace(/-/g, ' ');
                }
            });

            if (currentSubcat && activeSubcategory !== currentSubcat) {
                setActiveSubcategory(currentSubcat);
                const buttonToScroll = subcategoryButtons[currentSubcat];
                if (buttonToScroll) {
                    subcategoryBarElement.scrollTo({
                        left: buttonToScroll.offsetLeft - subcategoryBarElement.offsetLeft,
                        behavior: 'smooth'
                    });
                }
            }
        }, 100);
    });
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

foodTabBtn.addEventListener('click', () => switchMainTab('Food'));
drinkTabBtn.addEventListener('click', () => switchMainTab('Drinks'));
themeToggle.addEventListener('click', toggleTheme);

document.addEventListener('DOMContentLoaded', fetchAndCacheMenu);