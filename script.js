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
        { name: "Cerveza sin alcohol", price: "$3.500" }
    ],
    "Vinos": [
        { name: "Cabernet Sauvignon", price: "$8.900" },
        { name: "Malbec", price: "$8.500" },
        { name: "Carmenere", price: "$9.200" },
        { name: "Syrah", price: "$8.800" }
    ],
    "Refrescos": [
        { name: "Coca Cola", price: "$1.800" },
        { name: "Limonada", price: "$2.200" },
        { name: "Agua mineral", price: "$1.500" },
        { name: "Jugo natural", price: "$2.500" }
    ],
    "Cócteles": [
        { name: "Mojito", price: "$5.500" },
        { name: "Margarita", price: "$5.800" },
        { name: "Pisco Sour", price: "$4.900" },
        { name: "Caipirinha", price: "$5.200" }
    ],
    "Entradas": [
        { name: "Bruschetta", price: "$4.000" },
        { name: "Empanadas de pino", price: "$3.500" },
        { name: "Tabla de quesos", price: "$6.500" },
        { name: "Ceviche de reineta", price: "$7.200" }
    ],
    "Pastas": [
        { name: "Spaghetti Bolognese", price: "$8.500" },
        { name: "Penne Alfredo", price: "$8.200" },
        { name: "Lasagna de carne", price: "$9.000" },
        { name: "Fettuccine pesto", price: "$8.300" }
    ],
    "Carnes": [
        { name: "Bife de chorizo", price: "$12.800" },
        { name: "Pollo grillado", price: "$9.500" },
        { name: "Costillas BBQ", price: "$11.900" },
        { name: "Lomo vetado", price: "$13.500" }
    ],
    "Postres": [
        { name: "Tiramisú", price: "$4.500" },
        { name: "Helado artesanal", price: "$3.800" },
        { name: "Cheesecake", price: "$4.200" },
        { name: "Brownie con helado", price: "$4.900" }
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
