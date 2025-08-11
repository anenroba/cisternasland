// ================================
// Configuración de cache y API
// ================================
const CACHE_KEY = 'cartaData';
const CACHE_TIME_KEY = 'cartaDataTime';
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hora en milisegundos
const API_URL = 'https://api-swa.onrender.com//api/carta'; // Ajusta a tu backend real
let currentCategory = 'food';
let currentSubcategory = '';
let cartaData = [];
let subcategories = { food: [], drink: [] };
let cart = [];

// ================================
// Cargar carta desde API con cache
// ================================
async function fetchCartaDataFromAPI() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Respuesta no válida del servidor`);
    }
    return data;
  } catch (error) {
    console.error('Error al obtener carta:', error);
    throw error;
  }
}

async function loadCartaData() {
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);

  if (cachedTime && cachedData && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
    cartaData = JSON.parse(cachedData);
    processCartaData(cartaData);
  } else {
    const data = await fetchCartaDataFromAPI();
    cartaData = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    processCartaData(data);
  }
}

// ================================
// Procesar carta para categorías y subcategorías
// ================================
function processCartaData(data) {
  subcategories = { food: [], drink: [] };

  data.forEach(item => {
    const categoryType = getCategoryType(item.categoria);
    const normalizedSub = item.subcategoria.toLowerCase();
    if (!subcategories[categoryType].find(sub => sub.nombre.toLowerCase() === normalizedSub)) {
      subcategories[categoryType].push({ nombre: item.subcategoria });
    }
  });

  renderSubcategories(currentCategory);

  // Asignar subcategoría inicial
  if (subcategories[currentCategory].length > 0) {
    currentSubcategory = subcategories[currentCategory][0].nombre;
    renderProducts(currentCategory, currentSubcategory);
    highlightActiveSubcategory(currentSubcategory);
  }
}

function getCategoryType(categoria) {
  const drinkCategories = [
    'Botellas', 'Cervezas', 'Coctelería', 'Gin', 'Licores', 'Pisco',
    'Ron', 'Tequila', 'Vodka', 'Vinos & Espumantes', 'Whisky', 'Sin alcohol', 'Degustaciones'
  ];
  return drinkCategories.includes(categoria) ? 'drink' : 'food';
}

// ================================
// Renderizado de subcategorías
// ================================
function renderSubcategories(categoryType) {
  const subcatContainer = document.getElementById('subcategories');
  subcatContainer.innerHTML = '';
  subcategories[categoryType].forEach(sub => {
    const btn = document.createElement('button');
    btn.textContent = sub.nombre;
    btn.addEventListener('click', () => {
      currentSubcategory = sub.nombre;
      renderProducts(categoryType, sub.nombre);
      highlightActiveSubcategory(sub.nombre);
    });
    subcatContainer.appendChild(btn);
  });
}

function highlightActiveSubcategory(subcategoryName) {
  document.querySelectorAll('#subcategories button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === subcategoryName);
  });
}

// ================================
// Renderizado de productos
// ================================
function renderProducts(categoryType, subcategoryName) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  cartaData
    .filter(item => getCategoryType(item.categoria) === categoryType && item.subcategoria === subcategoryName)
    .forEach(item => {
      item.productos.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
          <h3>${product.nombre}</h3>
          <p>${product.descripcion || ''}</p>
          <span>$${product.precio}</span>
          <button class="add-btn" data-product="${encodeURIComponent(JSON.stringify(product))}">Agregar</button>
        `;
        card.querySelector('.add-btn').addEventListener('click', e => {
          const prod = JSON.parse(decodeURIComponent(e.target.getAttribute('data-product')));
          addToCart(prod);
        });
        productList.appendChild(card);
      });
    });
}

// ================================
// Carrito
// ================================
function addToCart(product) {
  const existing = cart.find(p => p.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderCart();
}

function removeFromCart(productId) {
  const itemEl = document.querySelector(`.cart-item[data-id="${productId}"]`);
  if (itemEl) {
    itemEl.classList.add('fade-out');
    setTimeout(() => {
      cart = cart.filter(p => p.id !== productId);
      renderCart();
    }, 300);
  }
}

function renderCart() {
  const cartList = document.getElementById('cart-items');
  cartList.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.classList.add('cart-item');
    li.setAttribute('data-id', item.id);
    li.innerHTML = `
      ${item.nombre} x${item.quantity} - $${item.precio * item.quantity}
      <button onclick="removeFromCart(${item.id})">X</button>
    `;
    cartList.appendChild(li);
  });
}

// ================================
// Enviar pedido
// ================================
async function sendOrder() {
  if (cart.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const tableNumber = prompt('Ingrese número de mesa:');
  if (!tableNumber) return;

  const payload = {
    table_number: parseInt(tableNumber),
    items: cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }))
  };

  try {
    const response = await fetch('https://api-swa.onrender.com//api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Error inesperado del servidor (${response.status})`);
    }

    if (!response.ok) throw new Error(result.message || 'Error al enviar el pedido.');

    alert('Pedido enviado con éxito.');
    cart = [];
    renderCart();
  } catch (error) {
    console.error('Error al enviar pedido:', error);
    alert(error.message);
  }
}

// ================================
// Inicialización
// ================================
document.addEventListener('DOMContentLoaded', () => {
  loadCartaData();

  document.getElementById('send-order').addEventListener('click', sendOrder);

  document.getElementById('category-food').addEventListener('click', () => {
    currentCategory = 'food';
    renderSubcategories('food');
    if (subcategories.food.length > 0) {
      currentSubcategory = subcategories.food[0].nombre;
      renderProducts('food', currentSubcategory);
      highlightActiveSubcategory(currentSubcategory);
    }
  });

  document.getElementById('category-drink').addEventListener('click', () => {
    currentCategory = 'drink';
    renderSubcategories('drink');
    if (subcategories.drink.length > 0) {
      currentSubcategory = subcategories.drink[0].nombre;
      renderProducts('drink', currentSubcategory);
      highlightActiveSubcategory(currentSubcategory);
    }
  });
});
