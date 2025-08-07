const API_URL = 'https://api-swa.onrender.com/api/carta';
const LOCAL_STORAGE_KEY = 'cisternasMenuData';

let menuDataGlobal = [];
const categoryBarElement = document.getElementById('categoryBar');
const contentSectionsContainer = document.getElementById('contentSections');
const headerElement = document.getElementById('header');
const mainContainer = document.getElementById('mainContainer');

async function fetchAndCacheMenu() {
    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedData) {
        console.log('Cargando carta desde localStorage...');
        menuDataGlobal = JSON.parse(cachedData);
        renderMenu(menuDataGlobal);
    } else {
        console.log('Cargando carta desde la API...');
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            menuDataGlobal = data;
            renderMenu(menuDataGlobal);
        } catch (error) {
            console.error('Error al obtener la carta:', error);
            contentSectionsContainer.innerHTML = '<p class="loading-message text-center p-4 text-red-500">Error al cargar la carta. Por favor, inténtelo de nuevo más tarde.</p>';
        }
    }
}

function renderMenu(dataToRender) {
    contentSectionsContainer.innerHTML = '';
    categoryBarElement.innerHTML = '';

    if (!dataToRender || dataToRender.length === 0) {
        contentSectionsContainer.innerHTML = '<p class="loading-message text-center p-4">No hay ítems para mostrar.</p>';
        return;
    }

    const groupedData = {};
    dataToRender.forEach(item => {
        if (!groupedData[item.categoria]) {
            groupedData[item.categoria] = {};
        }
        if (!groupedData[item.categoria][item.subcategoria]) {
            groupedData[item.categoria][item.subcategoria] = [];
        }
        groupedData[item.categoria][item.subcategoria].push(...item.productos);
    });

    const categoryOrder = Object.keys(groupedData).sort();

    // Renderizar los botones de categoría
    categoryOrder.forEach((categoryKey, index) => {
        const categoryName = formatText(categoryKey);
        const button = document.createElement('button');
        button.className = `category-button ${index === 0 ? 'active' : ''}`;
        button.textContent = categoryName;
        button.dataset.category = categoryKey.replace(/\s/g, '-');
        categoryBarElement.appendChild(button);
    });

    // Renderizar las secciones y productos
    categoryOrder.forEach(categoryKey => {
        const categoryName = formatText(categoryKey);
        const section = document.createElement('section');
        section.id = `category-${categoryKey.replace(/\s/g, '-')}`;
        section.className = 'category-section';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4';
        title.textContent = categoryName;
        section.appendChild(title);

        const productListDiv = document.createElement('div');
        productListDiv.className = 'product-list';
        
        for (const subcategoryKey in groupedData[categoryKey]) {
            const subcategoryName = formatText(subcategoryKey);
            
            // Renderizar un título de subcategoría solo si es diferente a la categoría principal
            if (subcategoryKey.toLowerCase() !== categoryKey.toLowerCase()) {
                const subcategoryTitle = document.createElement('h3');
                subcategoryTitle.className = 'text-lg font-semibold mt-4 mb-2';
                subcategoryTitle.textContent = subcategoryName;
                productListDiv.appendChild(subcategoryTitle);
            }

            const products = groupedData[categoryKey][subcategoryKey];
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div>
                        <h3 class="text-lg font-semibold">${product.nombre}</h3>
                        ${product.descripcion ? `<p class="text-sm mb-1">${product.descripcion}</p>` : ''}
                    </div>
                    <p class="text-md font-bold ml-auto">$${new Intl.NumberFormat('es-CL').format(product.precio)}</p>
                `;
                productListDiv.appendChild(productCard);
            });
        }
        section.appendChild(productListDiv);
        contentSectionsContainer.appendChild(section);
    });

    addCategoryButtonListeners();
    adjustLayout();
}

function formatText(text) {
    if (!text) return '';
    const formatted = text.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');
    return formatted.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


function addCategoryButtonListeners() {
    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetId = `category-${button.dataset.category}`;
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = headerElement.offsetHeight;
                const categoryBarHeight = categoryBarElement.offsetHeight;
                const offset = headerHeight + categoryBarHeight;
                
                window.scrollTo({
                    top: targetElement.offsetTop - offset + 1,
                    behavior: "smooth"
                });
            }
        });
    });
}

function adjustLayout() {
    const headerHeight = headerElement.offsetHeight;
    const categoryBarHeight = categoryBarElement.offsetHeight;
    categoryBarElement.style.top = `${headerHeight}px`;
    mainContainer.style.paddingTop = `${headerHeight + categoryBarHeight}px`;
}

window.addEventListener('scroll', () => {
    const headerHeight = headerElement.offsetHeight;
    const categoryBarHeight = categoryBarElement.offsetHeight;
    
    let firstVisibleSection = null;
    const sections = document.querySelectorAll('.category-section');
    const scrollPosition = window.scrollY + headerHeight + categoryBarHeight + 50;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            firstVisibleSection = section;
        }
    });

    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(btn => btn.classList.remove('active'));

    if (firstVisibleSection) {
        const button = document.querySelector(`.category-button[data-category="${firstVisibleSection.id.split('-')[1]}"]`);
        if (button) {
            button.classList.add('active');
        }
    }
});

window.addEventListener('load', () => {
    fetchAndCacheMenu();
    adjustLayout();
});

window.addEventListener('resize', adjustLayout);