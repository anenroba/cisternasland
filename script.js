// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');
// Check for saved theme preference or default to light
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
}

themeToggle.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
});

// Get table number from URL
const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get('mesa') || '--';
document.getElementById('tableNumber').textContent = tableNumber;

// Cart functionality
let cart = [];
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const clearCart = document.getElementById('clearCart');
const checkout = document.getElementById('checkout');
// Update cart count
function updateCartCount() {
    cartCount.textContent = cart.length;
    if (cart.length > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
}

// Initialize cart count
updateCartCount();
// Cart button click event - show modal
cartBtn.addEventListener('click', () => {
    renderCartItems();
    cartModal.classList.add('active');
});
// Close cart modal
closeCart.addEventListener('click', () => {
    cartModal.classList.remove('active');
});
// Close modal when clicking outside
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
    }
});
// Clear cart
clearCart.addEventListener('click', () => {
    cart = [];
    updateCartCount();
    renderCartItems();
});
// Checkout
checkout.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    alert(`Pedido enviado a la mesa ${tableNumber}\n\nTotal: ${formatPrice(total)}\n\nGracias por tu compra!`);
    cart = [];
    updateCartCount();
    cartModal.classList.remove('active');
});
// Render cart items
function renderCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
      
                  <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.textContent = '$0';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.price;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
      
          cartItem.innerHTML = `
            <div class="cart-item-image" style="background-image: url('https://picsum.photos/seed/${item.id}/200/200.jpg')"></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
           
             <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <button class="cart-item-remove" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
      
          `;
        
        // Add event listener to remove button
        const removeBtn = cartItem.querySelector('.cart-item-remove');
        removeBtn.addEventListener('click', () => {
      
              removeFromCart(index);
        });
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = formatPrice(total);
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCartItems();
}

// Category and Subcategory Data
const categories = {
    drink: {
        name: 'Drink',
        subcategories: [
            { id: 'soft-drinks', name: 'Refrescos' },
            { id: 'beers', name: 'Cervezas' },
            { id: 'wines', name: 'Vinos' },
            { id: 'cocktails', name: 'Cócteles' },
            { id: 'coffee', name: 'Café' },
            { id: 'juices', name: 'Jugos' },
            { id: 'spirits', name: 'Bebidas Espirituosas' },
            { id: 'water', name: 'Agua' }
        ]
   
         },
    food: {
        name: 'Food',
        subcategories: [
            { id: 'appetizers', name: 'Entradas' },
            { id: 'main-courses', name: 'Platos Principales' },
            { id: 'burgers', name: 'Hamburguesas' },
            { id: 'pizzas', name: 'Pizzas' },
            { id: 'pasta', name: 'Pasta' },
            { id: 'salads', name: 'Ensaladas' },
            { id: 'seafood', name: 'Mariscos' },
            { id: 'desserts', name: 'Postres' }
        ]
    }
};

// Sample Products Data (prices in Chilean Pesos) - EXPANDED
const productsData = {
    'soft-drinks': [
        { id: 1, name: 'Coca Cola', description: 'Refresco de cola clásico', price: 2500 },
        { id: 2, name: 'Pepsi', description: 'Refresco de cola', price: 2500 },
        { id: 3, name: 'Sprite', description: 'Refresco de lima-limón', price: 2500 },
        { id: 4, name: 'Fanta', description: 'Refresco de naranja', price: 2500 },
        { id: 6, name: 'Té Helado', description: 'Té helado de limón', price: 2000 },
        { id: 25, name: 'Ginger Ale', description: 'Refresco de jengibre', price: 2200 },
        { id: 29, name: 'Kem Piña', description: 'Refresco sabor piña', price: 2500 },
        { id: 30, name: 'Bilz', description: 'Refresco color rojo', price: 2500 },
        { id: 31, name: 'Pap', description: 'Refresco color amarillo', price: 2500 },
    ],
    'beers': [
        { id: 7, name: 'Heineken', description: 'Cerveza lager holandesa', price: 3500 },
        { id: 8, name: 'Corona', description: 'Cerveza mexicana', price: 3000 },
        { id: 9, name: 'Stella Artois', description: 'Cerveza belga', price: 3500 },
        { id: 10, name: 'Budweiser', description: 'Cerveza americana', price: 3000 },
        { id: 11, name: 'Guinness', description: 'Cerveza negra irlandesa', price: 4000 },
        { id: 26, name: 'IPA', description: 'India Pale Ale', price: 4200 },
        { id: 32, name: 'Kunstmann Torobayo', description: 'Cerveza chilena', price: 4500 },
        { id: 33, name: 'Royal Guard', description: 'Cerveza lager chilena', price: 3200 },
        { id: 34, name: 'Austral Calafate', description: 'Cerveza con fruto de calafate', price: 4800 },
        { id: 35, name: 'Kross Golden', description: 'Cerveza artesanal chilena', price: 4500 }
    ],
    'wines': [
        { id: 36, name: 'Copa Carmenere', description: 'Vino tinto, cepa chilena', price: 4500 },
        { id: 37, name: 'Copa Merlot', description: 'Vino tinto, suave y frutal', price: 4500 },
        { id: 38, name: 'Copa Cabernet S.', description: 'Vino tinto, con cuerpo', price: 4500 },
        { id: 39, name: 'Copa Sauvignon Blanc', description: 'Vino blanco, cítrico y fresco', price: 4500 },
        { id: 40, name: 'Botella Santa Helena', description: 'Vino tinto botella 750cc', price: 12000 },
        { id: 41, name: 'Botella Casillero del Diablo', description: 'Vino blanco botella 750cc', price: 15000 }
    ],
    'cocktails': [
        { id: 42, name: 'Pisco Sour', description: 'Pisco, limón, goma', price: 5500 },
        { id: 43, name: 'Mojito Cubano', description: 'Ron, menta, limón, soda', price: 6000 },
        { id: 44, name: 'Caipirinha', description: 'Cachaça, limón, azúcar', price: 6000 },
        { id: 45, name: 'Margarita', description: 'Tequila, limón, triple sec', price: 6500 },
        { id: 46, name: 'Aperol Spritz', description: 'Aperol, espumante, soda', price: 7000 },
        { id: 47, name: 'Ramazzotti Spritz', description: 'Ramazzotti, espumante, soda', price: 7000 },
        { id: 48, name: 'Piña Colada', description: 'Ron, piña, coco', price: 6500 }
    ],
    'coffee': [
        { id: 49, name: 'Espresso', description: 'Café corto e intenso', price: 2000 },
        { id: 50, name: 'Americano', description: 'Espresso diluido con agua caliente', price: 2200 },
        { id: 51, name: 'Latte', description: 'Espresso con leche vaporizada', price: 2800 },
        { id: 52, name: 'Cappuccino', description: 'Espresso, leche y espuma de leche', price: 2800 },
        { id: 53, name: 'Mokaccino', description: 'Cappuccino con un toque de chocolate', price: 3200 },
    ],
    'juices': [
        { id: 54, name: 'Jugo de Naranja', description: 'Naranja natural recién exprimida', price: 3500 },
        { id: 55, name: 'Jugo de Frutilla', description: 'Frutillas frescas de estación', price: 3500 },
        { id: 56, name: 'Jugo de Piña', description: 'Piña natural y refrescante', price: 3500 },
        { id: 57, name: 'Jugo de Melón', description: 'Melón de temporada', price: 3500 },
    ],
    'spirits': [
        { id: 58, name: 'Pisco Alto del Carmen', description: '40°, doble destilado', price: 4500 },
        { id: 59, name: 'Ron Barceló', description: 'Ron dominicano añejo', price: 5000 },
        { id: 60, name: 'Whisky Johnnie Walker Red', description: 'Blended Scotch Whisky', price: 6000 },
        { id: 61, name: 'Vodka Absolut', description: 'Vodka sueco', price: 5500 },
        { id: 62, name: 'Gin Bombay Sapphire', description: 'London Dry Gin', price: 6500 },
    ],
    'water': [
        { id: 5, name: 'Agua Mineral', description: 'Agua mineral natural sin gas', price: 1500 },
        { id: 63, name: 'Agua con Gas', description: 'Agua mineral gasificada', price: 1500 },
        { id: 64, name: 'Agua Saborizada', description: 'Agua con sutil sabor frutal', price: 1800 },
    ],
    'appetizers': [
        { id: 12, name: 'Nachos', description: 'Nachos con queso y guacamole', price: 6500 },
        { id: 13, name: 'Alitas de Pollo', description: 'Alitas picantes con salsa', price: 7500 },
        { id: 14, name: 'Aros de Cebolla', description: 'Aros de cebolla crujientes', price: 5500 },
        { id: 15, name: 'Bruschetta', description: 'Pan tostado con tomate y albahaca', price: 6000 },
        { id: 16, name: 'Calamares', description: 'Calamares fritos con salsa tártara', price: 8000 },
        { id: 27, name: 'Papas Fritas', description: 'Papas fritas con salsa', price: 4500 },
        { id: 65, name: 'Empanadas de Queso', description: '5 unidades de empanadas fritas', price: 5800 },
        { id: 66, name: 'Tabla para Compartir', description: 'Quesos, jamón serrano y aceitunas', price: 12500 }
    ],
    'main-courses': [
        { id: 67, name: 'Lomo Saltado', description: 'Trozos de carne, cebolla, tomate y papas fritas', price: 11500 },
        { id: 68, name: 'Salmón a la Plancha', description: 'Con agregado de arroz o puré', price: 12500 },
        { id: 69, name: 'Pollo Asado', description: 'Medio pollo asado con papas rústicas', price: 10500 },
        { id: 70, name: 'Bife Chorizo', description: 'Corte de vacuno a la parrilla con ensalada', price: 13500 },
    ],
    'burgers': [
        { id: 71, name: 'Hamburguesa Clásica', description: 'Lechuga, tomate, cebolla, queso', price: 8500 },
        { id: 72, name: 'Hamburguesa Americana', description: 'Queso cheddar, tocino, aros de cebolla', price: 9500 },
        { id: 73, name: 'Hamburguesa Veggie', description: 'Hamburguesa de lentejas, palta y tomate', price: 8000 },
        { id: 74, name: 'Hamburguesa Royal', description: 'Lechuga, tomate, queso, huevo frito', price: 9200 },
    ],
    'pizzas': [
        { id: 75, name: 'Pizza Margarita', description: 'Salsa de tomate, mozzarella, albahaca', price: 9000 },
        { id: 76, name: 'Pizza Pepperoni', description: 'Salsa de tomate, mozzarella, pepperoni', price: 10500 },
        { id: 77, name: 'Pizza Napolitana', description: 'Mozzarella, tomate en rodajas, aceitunas', price: 10000 },
        { id: 78, name: 'Pizza Española', description: 'Mozzarella, chorizo, pimentón', price: 11000 },
    ],
    'pasta': [
        { id: 79, name: 'Lasaña Boloñesa', description: 'Clásica lasaña con carne y salsa bechamel', price: 9500 },
        { id: 80, name: 'Spaghetti Alfredo', description: 'Con salsa de crema, jamón y champiñones', price: 9000 },
        { id: 81, name: 'Ravioles Ricotta', description: 'Rellenos de ricotta y espinaca con salsa a elección', price: 9800 },
    ],
    'salads': [
        { id: 17, name: 'César', description: 'Ensalada César con pollo', price: 7500 },
        { id: 18, name: 'Griega', description: 'Ensalada griega con aceitunas', price: 7000 },
        { id: 19, name: 'Caprese', description: 'Tomate, mozzarella y albahaca', price: 7000 },
        { id: 20, name: 'Waldorf', description: 'Manzana, apio y nueces', price: 6500 },
        { id: 28, name: 'Tropical', description: 'Ensalada de frutas tropicales', price: 6800 },
        { id: 82, name: 'Ensalada de Quínoa', description: 'Con palta, tomate cherry y pimentón', price: 7200 }
    ],
    'seafood': [
        { id: 83, name: 'Ceviche Mixto', description: 'Pescado y camarones marinados en limón', price: 9800 },
        { id: 84, name: 'Machas a la Parmesana', description: 'Machas gratinadas con queso parmesano', price: 11000 },
        { id: 85, name: 'Jardín de Mariscos', description: 'Selección de mariscos fríos', price: 13000 },
    ],
    'desserts': [
        { id: 86, name: 'Tiramisú', description: 'Postre italiano a base de café y queso mascarpone', price: 4500 },
        { id: 87, name: 'Cheesecake de Maracuyá', description: 'Pastel de queso con salsa de maracuyá', price: 4800 },
        { id: 88, name: 'Mousse de Chocolate', description: 'Suave y aireado mousse de chocolate bitter', price: 4200 },
        { id: 89, name: 'Copa de Helado', description: 'Tres sabores de helado a elección', price: 4000 },
        { id: 90, name: 'Torta Tres Leches', description: 'Bizcocho bañado en tres tipos de leche', price: 4500 },
    ]
};

// Format price for Chilean Pesos
function formatPrice(price) {
    return '$' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

let currentCategory = 'drink';
let currentSubcategory = 'soft-drinks';
let page = 0;
let isLoading = false;

// Initialize the page
function init() {
    loadSubcategories(currentCategory);
    loadProducts(currentSubcategory, true);
    
    // Category buttons event
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            if (category !== currentCategory) {
       
                 currentCategory = category;
                currentSubcategory = categories[category].subcategories[0].id;
                
                // Update active states
    
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                loadSubcategories(category);
      
                  loadProducts(currentSubcategory, true);
            }
        });
    });
    // Infinite scroll
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isLoading) {
            loadProducts(currentSubcategory, false);
        }
    });
}

// Load subcategories for a category
function loadSubcategories(category) {
    const container = document.getElementById('subcategoryContainer');
    container.innerHTML = '';
    
    categories[category].subcategories.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.textContent = sub.name;
        btn.setAttribute('data-subcategory', sub.id);
        
       
                 if (sub.id === currentSubcategory) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => {
        
            currentSubcategory = sub.id;
            document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProducts(sub.id, true);
        });
       
         
        container.appendChild(btn);
    });
}

// Load products for a subcategory
function loadProducts(subcategory, reset = false) {
    if (isLoading) return;
    isLoading = true;
    document.getElementById('loadingIndicator').style.display = 'flex';
    
    if (reset) {
        document.getElementById('productsGrid').innerHTML = '';
        page = 0;
    }
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        const products = productsData[subcategory] || [];
        const startIndex = page * 4;
    
            const endIndex = startIndex + 4;
        const pageProducts = products.slice(startIndex, endIndex);
        
        if (pageProducts.length > 0) {
            renderProducts(pageProducts);
       
             page++;
        }
        
        isLoading = false;
        document.getElementById('loadingIndicator').style.display = 'none';
    }, 800);
}

// Render products to the grid
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="product-thumbnail" style="background-image: url('https://picsum.photos/seed/${product.id}/200/200.jpg')"></div>
    
                    <div class="product-info">
                <div class="product-header">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
                <p class="product-description">${product.description}</p>
                <button class="add-btn" data-product='${JSON.stringify(product)}'>
                         
                   <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        // Add event listener to the add button
        const addBtn = card.querySelector('.add-btn');
        addBtn.addEventListener('click', () => {
            const productData = JSON.parse(addBtn.getAttribute('data-product'));
            addToCart(productData);
            
            // Visual feedback
    
                const originalBg = addBtn.style.backgroundColor;
            addBtn.style.backgroundColor = 'var(--price-color)';
            setTimeout(() => {
                addBtn.style.backgroundColor = originalBg;
           
                 }, 300);
        });
        
        grid.appendChild(card);
    });
}

// Add product to cart
function addToCart(product) {
    cart.push(product);
    updateCartCount();
}

// Initialize the application
init();