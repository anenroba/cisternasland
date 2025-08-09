// --- CONFIGURACIÓN Y VARIABLES GLOBALES ---

// URL del endpoint de la API
const API_URL = 'https://api-swa.onrender.com/api/carta';
// Clave para guardar los datos en localStorage
const CACHE_KEY = 'menuCache';

// Variable global para almacenar los datos del menú una vez cargados
let menuData = [];

// Estado de la aplicación
let currentCategory = 'drink'; // 'drink' o 'food'
let currentSubcategoryId = null; // ID numérico de la subcategoría
let page = 0;
let isLoading = false;
let cart = [];

// Mapeo de identificadores del HTML a los nombres de categoría de la API
const categoryMap = {
    drink: 'Bebestibles',
    food: 'Comestibles'
};

// --- INICIALIZACIÓN DE LA APLICACIÓN ---

document.addEventListener('DOMContentLoaded', init);

async function init() {
    setupEventListeners();
    await initializeMenuData(); // Carga datos desde cache o API
    
    // Si los datos se cargaron correctamente, renderiza la vista inicial
    if (menuData && menuData.length > 0) {
        const initialCategoryName = categoryMap[currentCategory];
        const initialCategoryData = menuData.find(cat => cat.nombre_cat === initialCategoryName);

        // ----> ESTA ES LA LÍNEA CORREGIDA <----
        // Se asegura de que 'subcategorias' exista antes de intentar leer su 'length'.
        if (initialCategoryData && initialCategoryData.subcategorias && initialCategoryData.subcategorias.length > 0) {
            currentSubcategoryId = initialCategoryData.subcategorias[0].id_sub;
            loadSubcategories(currentCategory);
            await loadProducts(currentSubcategoryId, true);
        }
    }
}

// --- LÓGICA DE DATOS (CACHE Y API) ---

async function initializeMenuData() {
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (cachedData && cachedData !== 'undefined' && cachedData !== 'null') {
        console.log("Cargando datos desde localStorage...");
        try {
            menuData = JSON.parse(cachedData);
        } catch (error) {
            console.error("Error al parsear datos del cache. Obteniendo datos de la API...", error);
            localStorage.removeItem(CACHE_KEY);
            await fetchAndCacheMenuData();
        }
    } else {
        console.log("No hay cache válido. Obteniendo datos desde la API...");
        await fetchAndCacheMenuData();
    }
}

// Función auxiliar para obtener y guardar los datos de la API, evitando código duplicado
async function fetchAndCacheMenuData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error de red: ${response.statusText}`);
        }
        const data = await response.json();
        menuData = data.carta; // Extraemos el arreglo 'carta'
        localStorage.setItem(CACHE_KEY, JSON.stringify(menuData));
        console.log("Datos guardados en localStorage.");
    } catch (error) {
        console.error("No se pudo obtener el menú:", error);
        document.getElementById('productsGrid').innerHTML = '<p style="text-align:center; color: var(--text-secondary);">No hemos podido cargar el menú. Por favor, intenta recargar la página.</p>';
    }
}


// --- RENDERIZADO DE LA INTERFAZ ---

function loadSubcategories(categoryIdentifier) {
    const container = document.getElementById('subcategoryContainer');
    container.innerHTML = '';

    const categoryName = categoryMap[categoryIdentifier];
    const categoryData = menuData.find(cat => cat.nombre_cat === categoryName);

    if (categoryData && categoryData.subcategorias) {
        categoryData.subcategorias.forEach(sub => {
            const btn = document.createElement('button');
            btn.className = 'subcategory-btn';
            btn.textContent = sub.nombre_sub;
            btn.setAttribute('data-subcategory-id', sub.id_sub);

            if (sub.id_sub === currentSubcategoryId) {
                btn.classList.add('active');
            }
            container.appendChild(btn);
        });
    }
}

async function loadProducts(subcategoryId, reset = false) {
    if (isLoading) return;
    isLoading = true;
    document.getElementById('loadingIndicator').style.display = 'flex';

    if (reset) {
        document.getElementById('productsGrid').innerHTML = '';
        page = 0;
    }

    await new Promise(resolve => setTimeout(resolve, 500)); 

    let products = [];
    // Encontrar los productos para la subcategoría dada
    for (const category of menuData) {
        const subcategory = category.subcategorias.find(sub => sub.id_sub === subcategoryId);
        if (subcategory) {
            products = subcategory.productos || [];
            break;
        }
    }

    const startIndex = page * 8;
    const endIndex = startIndex + 8;
    const pageProducts = products.slice(startIndex, endIndex);

    if (pageProducts.length > 0) {
        renderProducts(pageProducts);
        page++;
    }

    isLoading = false;
    document.getElementById('loadingIndicator').style.display = 'none';
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imageUrl = product.foto || `https://picsum.photos/seed/${product.id_prod}/200/200.jpg`;

        card.innerHTML = `
            <div class="product-thumbnail" style="background-image: url('${imageUrl}')"></div>
            <div class="product-info">
                <div class="product-header">
                    <h3 class="product-name">${product.nombre_prod}</h3>
                    <span class="product-price">${formatPrice(product.precio)}</span>
                </div>
                <p class="product-description">${product.descripcion}</p>
                <button class="add-btn" data-product-id="${product.id_prod}">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- MANEJO DE EVENTOS (LISTENERS) ---

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);

    // Botones de categoría principal (Drink/Food)
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleCategoryClick(e.currentTarget));
    });

    // Contenedor de subcategorías (delegación de eventos)
    document.getElementById('subcategoryContainer').addEventListener('click', (e) => {
        if (e.target.matches('.subcategory-btn')) {
            handleSubcategoryClick(e.target);
        }
    });

    // Grid de productos para añadir al carrito (delegación de eventos)
    document.getElementById('productsGrid').addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-btn');
        if (addBtn) {
            const productId = parseInt(addBtn.getAttribute('data-product-id'), 10);
            handleAddToCartClick(productId, addBtn);
        }
    });

    // Scroll infinito
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isLoading) {
            loadProducts(currentSubcategoryId, false);
        }
    });

    // Funcionalidad del carrito
    document.getElementById('cartBtn').addEventListener('click', openCartModal);
    document.getElementById('closeCart').addEventListener('click', closeCartModal);
    document.getElementById('cartModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('cartModal')) closeCartModal();
    });
    document.getElementById('clearCart').addEventListener('click', clearCart);
    document.getElementById('checkout').addEventListener('click', checkout);
    document.getElementById('cartItems').addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.cart-item-remove');
        if (removeBtn) {
            const cartIndex = parseInt(removeBtn.getAttribute('data-index'), 10);
            removeFromCart(cartIndex);
        }
    });

    // Cargar estado inicial del tema y número de mesa
    initializeTheme();
    initializeTableNumber();
}

function handleCategoryClick(btn) {
    const categoryIdentifier = btn.getAttribute('data-category');
    if (categoryIdentifier === currentCategory) return;

    currentCategory = categoryIdentifier;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const categoryName = categoryMap[categoryIdentifier];
    const categoryData = menuData.find(cat => cat.nombre_cat === categoryName);
    if (categoryData && categoryData.subcategorias && categoryData.subcategorias.length > 0) {
        currentSubcategoryId = categoryData.subcategorias[0].id_sub;
        loadSubcategories(currentCategory);
        loadProducts(currentSubcategoryId, true);
    } else {
        // Si la categoría no tiene subcategorías, limpiar la vista
        document.getElementById('subcategoryContainer').innerHTML = '';
        document.getElementById('productsGrid').innerHTML = `<p style="text-align:center; color: var(--text-secondary);">No hay productos en esta categoría.</p>`;
    }
}

function handleSubcategoryClick(btn) {
    const subcategoryId = parseInt(btn.getAttribute('data-subcategory-id'), 10);
    if (subcategoryId === currentSubcategoryId) return;

    currentSubcategoryId = subcategoryId;
    document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadProducts(currentSubcategoryId, true);
}

function handleAddToCartClick(productId, addBtn) {
    let productToAdd = null;
    for (const category of menuData) {
        // Nos aseguramos que la categoría tenga subcategorías antes de iterar
        if (category.subcategorias) {
            for (const subcategory of category.subcategorias) {
                const foundProduct = subcategory.productos.find(p => p.id_prod === productId);
                if (foundProduct) {
                    productToAdd = foundProduct;
                    break;
                }
            }
        }
        if (productToAdd) break;
    }

    if (productToAdd) {
        cart.push(productToAdd);
        updateCartCount();
        
        addBtn.style.backgroundColor = 'var(--price-color)';
        setTimeout(() => { addBtn.style.backgroundColor = ''; }, 300);
    }
}


// --- FUNCIONALIDAD DEL CARRITO ---

function openCartModal() {
    renderCartItems();
    document.getElementById('cartModal').classList.add('active');
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
}

function updateCartCount() {
    const cartCountEl = document.getElementById('cartCount');
    cartCountEl.textContent = cart.length;
    cartCountEl.style.display = cart.length > 0 ? 'flex' : 'none';
}

function clearCart() {
    cart = [];
    updateCartCount();
    renderCartItems();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCartItems();
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p>
            </div>`;
        cartTotalEl.textContent = formatPrice(0);
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.precio;
        const imageUrl = item.foto || `https://picsum.photos/seed/${item.id_prod}/200/200.jpg`;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image" style="background-image: url('${imageUrl}')"></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.nombre_prod}</div>
                <div class="cart-item-price">${formatPrice(item.precio)}</div>
            </div>
            <button class="cart-item-remove" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>`;
        cartItemsContainer.appendChild(cartItem);
    });

    cartTotalEl.textContent = formatPrice(total);
}

function checkout() {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.precio, 0);
    const tableNumber = document.getElementById('tableNumber').textContent;
    alert(`Pedido enviado a la mesa ${tableNumber}\n\nTotal: ${formatPrice(total)}\n\n¡Gracias por tu compra!`);
    
    clearCart();
    closeCartModal();
}


// --- FUNCIONES UTILITARIAS ---

function formatPrice(price) {
    return '$' + (price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
}

function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

function initializeTableNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('mesa') || '--';
    document.getElementById('tableNumber').textContent = tableNumber;
}