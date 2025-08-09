const subCategories = {
    drink: ["Cervezas", "Vinos", "Refrescos", "Cócteles"],
    food: ["Entradas", "Pastas", "Carnes", "Postres"]
};

const productsData = {
    "Cervezas": [
        { name: "IPA artesanal", price: "$4.500" },
        { name: "Lager clásica", price: "$3.800" },
        { name: "Stout negra", price: "$4.200" },
        { name: "Pale Ale", price: "$4.000" },
        { name: "Cerveza sin alcohol", price: "$3.500" },
        { name: "Amber Ale", price: "$4.300" },
        { name: "Porter", price: "$4.400" },
        { name: "Cerveza de trigo", price: "$4.100" },
        { name: "Golden Ale", price: "$4.200" },
        { name: "Red Ale", price: "$4.300" },
        { name: "Cerveza artesanal IPA doble", price: "$5.200" },
        { name: "Cerveza negra fuerte", price: "$4.800" },
        { name: "Cerveza rubia liviana", price: "$3.900" },
        { name: "Cerveza frutal", price: "$4.500" },
        { name: "Cerveza ahumada", price: "$4.700" }
    ],
    "Vinos": [
        { name: "Cabernet Sauvignon", price: "$8.900" },
        { name: "Malbec", price: "$8.500" },
        { name: "Carmenere", price: "$9.200" },
        { name: "Syrah", price: "$8.800" },
        { name: "Pinot Noir", price: "$9.500" },
        { name: "Merlot", price: "$8.700" },
        { name: "Chardonnay", price: "$7.800" },
        { name: "Sauvignon Blanc", price: "$7.600" },
        { name: "Rosé", price: "$8.200" },
        { name: "Vino espumante brut", price: "$9.800" },
        { name: "Vino espumante dulce", price: "$9.500" },
        { name: "Vino gran reserva", price: "$12.500" },
        { name: "Vino reserva", price: "$10.800" },
        { name: "Vino orgánico", price: "$9.900" },
        { name: "Vino de autor", price: "$13.200" }
    ],
    "Refrescos": [
        { name: "Coca Cola", price: "$1.800" },
        { name: "Limonada", price: "$2.200" },
        { name: "Agua mineral", price: "$1.500" },
        { name: "Jugo natural", price: "$2.500" },
        { name: "Sprite", price: "$1.800" },
        { name: "Fanta", price: "$1.800" },
        { name: "Tónica", price: "$2.000" },
        { name: "Ginger Ale", price: "$2.200" },
        { name: "Jugo de naranja", price: "$2.400" },
        { name: "Jugo de piña", price: "$2.400" },
        { name: "Jugo de durazno", price: "$2.400" },
        { name: "Té helado", price: "$2.200" },
        { name: "Bebida light", price: "$1.900" },
        { name: "Agua saborizada", price: "$2.100" },
        { name: "Bebida energética", price: "$3.000" }
    ],
    "Cócteles": [
        { name: "Mojito", price: "$5.500" },
        { name: "Margarita", price: "$5.800" },
        { name: "Pisco Sour", price: "$4.900" },
        { name: "Caipirinha", price: "$5.200" },
        { name: "Daiquiri", price: "$5.400" },
        { name: "Tequila Sunrise", price: "$5.600" },
        { name: "Aperol Spritz", price: "$6.000" },
        { name: "Bloody Mary", price: "$5.500" },
        { name: "Whisky Sour", price: "$6.200" },
        { name: "Gin Tonic", price: "$5.800" },
        { name: "Piña Colada", price: "$5.700" },
        { name: "Mai Tai", price: "$6.000" },
        { name: "Moscow Mule", price: "$5.900" },
        { name: "Cosmopolitan", price: "$5.900" },
        { name: "Long Island Iced Tea", price: "$6.500" }
    ],
    "Entradas": [
        { name: "Bruschetta", price: "$4.000" },
        { name: "Empanadas de pino", price: "$3.500" },
        { name: "Tabla de quesos", price: "$6.500" },
        { name: "Ceviche de reineta", price: "$7.200" },
        { name: "Sopaipillas con pebre", price: "$3.000" },
        { name: "Anticuchos", price: "$4.800" },
        { name: "Calamares fritos", price: "$6.000" },
        { name: "Croquetas de jamón", price: "$4.500" },
        { name: "Pan amasado", price: "$2.500" },
        { name: "Ostras frescas", price: "$8.500" },
        { name: "Mini pastel de choclo", price: "$4.300" },
        { name: "Ensalada chilena", price: "$3.800" },
        { name: "Humitas", price: "$4.200" },
        { name: "Choritos a la parmesana", price: "$6.800" },
        { name: "Sopaipillas pasadas", price: "$3.500" }
    ],
    "Pastas": [
        { name: "Spaghetti Bolognese", price: "$8.500" },
        { name: "Penne Alfredo", price: "$8.200" },
        { name: "Lasagna de carne", price: "$9.000" },
        { name: "Fettuccine pesto", price: "$8.300" },
        { name: "Ravioli de espinaca", price: "$8.800" },
        { name: "Gnocchi con salsa", price: "$8.700" },
        { name: "Tagliatelle con mariscos", price: "$10.200" },
        { name: "Spaghetti al aglio e olio", price: "$8.100" },
        { name: "Macarrones gratinados", price: "$8.500" },
        { name: "Fusilli con pollo", price: "$8.600" },
        { name: "Pasta carbonara", price: "$8.900" },
        { name: "Canelones rellenos", price: "$9.100" },
        { name: "Tortellini con queso", price: "$8.900" },
        { name: "Pasta al pomodoro", price: "$8.000" },
        { name: "Lasaña vegetariana", price: "$9.000" }
    ],
    "Carnes": [
        { name: "Bife de chorizo", price: "$12.800" },
        { name: "Pollo grillado", price: "$9.500" },
        { name: "Costillas BBQ", price: "$11.900" },
        { name: "Lomo vetado", price: "$13.500" },
        { name: "Entraña", price: "$12.200" },
        { name: "Asado de tira", price: "$11.500" },
        { name: "Pechuga rellena", price: "$10.200" },
        { name: "Filete mignon", price: "$14.000" },
        { name: "Chuletón", price: "$15.500" },
        { name: "Cordero al horno", price: "$14.800" },
        { name: "Pernil al horno", price: "$10.800" },
        { name: "Costillar de cerdo", price: "$11.200" },
        { name: "Hamburguesa casera", price: "$9.800" },
        { name: "Albóndigas en salsa", price: "$9.200" },
        { name: "Brochetas mixtas", price: "$10.500" }
    ],
    "Postres": [
        { name: "Tiramisú", price: "$4.500" },
        { name: "Helado artesanal", price: "$3.800" },
        { name: "Cheesecake", price: "$4.200" },
        { name: "Brownie con helado", price: "$4.900" },
        { name: "Suspiro limeño", price: "$4.600" },
        { name: "Tres leches", price: "$4.800" },
        { name: "Mousse de chocolate", price: "$4.500" },
        { name: "Pie de limón", price: "$4.400" },
        { name: "Panqueque con manjar", price: "$4.700" },
        { name: "Flan casero", price: "$4.200" },
        { name: "Helado de piña", price: "$3.800" },
        { name: "Torta de hojarasca", price: "$4.900" },
        { name: "Kuchen de frambuesa", price: "$4.800" },
        { name: "Tarta de manzana", price: "$4.600" },
        { name: "Helado frito", price: "$5.200" }
    ]
};

const themeBtn = document.getElementById("toggle-theme");
const mesaText = document.getElementById("mesa-text");
const subCatsDiv = document.getElementById("sub-cats");
const productsDiv = document.getElementById("products");

// Leer número de mesa de la URL
const params = new URLSearchParams(window.location.search);
const mesa = params.get("mesa");
if (mesa) {
    mesaText.textContent = `Mesa: ${mesa}`;
}

// Modo oscuro/claro
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Mostrar subcategorías y productos iniciales
function loadSubCategories(cat) {
    subCatsDiv.innerHTML = "";
    subCategories[cat].forEach((sub, index) => {
        const btn = document.createElement("button");
        btn.textContent = sub;
        if (index === 0) btn.classList.add("active");
        btn.addEventListener("click", () => {
            document.querySelectorAll(".sub-cats button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadProducts(sub);
        });
        subCatsDiv.appendChild(btn);
    });
    loadProducts(subCategories[cat][0]);
}

function loadProducts(subCat) {
    productsDiv.innerHTML = "";
    productsData[subCat].forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `<span>${prod.name}</span><span class="price">${prod.price}</span>`;
        productsDiv.appendChild(div);
    });
}

// Manejo de cambio de categoría principal
document.querySelectorAll(".main-cats button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".main-cats button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        loadSubCategories(btn.dataset.cat);
    });
});

// Inicial
loadSubCategories("drink");
