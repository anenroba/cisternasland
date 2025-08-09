const subCategories = {
    drink: ["Cervezas", "Vinos", "Refrescos", "Cócteles"],
    food: ["Entradas", "Pastas", "Carnes", "Postres"]
};

const productsData = {
    "Cervezas": [
        { name: "IPA artesanal", price: "$5" },
        { name: "Lager clásica", price: "$4" }
    ],
    "Vinos": [
        { name: "Cabernet Sauvignon", price: "$8" },
        { name: "Malbec", price: "$7" }
    ],
    "Refrescos": [
        { name: "Cola", price: "$2" },
        { name: "Limonada", price: "$3" }
    ],
    "Cócteles": [
        { name: "Mojito", price: "$6" },
        { name: "Margarita", price: "$6" }
    ],
    "Entradas": [
        { name: "Bruschetta", price: "$5" },
        { name: "Empanadas", price: "$4" }
    ],
    "Pastas": [
        { name: "Spaghetti Bolognese", price: "$9" },
        { name: "Penne Alfredo", price: "$8" }
    ],
    "Carnes": [
        { name: "Bife de chorizo", price: "$12" },
        { name: "Pollo grillado", price: "$10" }
    ],
    "Postres": [
        { name: "Tiramisú", price: "$5" },
        { name: "Helado artesanal", price: "$4" }
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
