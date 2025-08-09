document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const mesaNumero = document.getElementById("mesa-numero");
    const categoryBtns = document.querySelectorAll(".category-btn");
    const subcategoryMenu = document.getElementById("subcategory-menu");
    const productList = document.getElementById("product-list");

    // Obtener número de mesa desde la URL
    const params = new URLSearchParams(window.location.search);
    const mesa = params.get("mesa");
    mesaNumero.textContent = mesa ? mesa : "--";

    // Modo claro/oscuro
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // Datos de productos
    const productos = {
        drink: {
            "Cervezas": [
                { nombre: "Cristal 500ml", precio: 2500 },
                { nombre: "Escudo 500ml", precio: 2700 },
                { nombre: "Corona 330ml", precio: 3500 },
                { nombre: "Heineken 500ml", precio: 3200 },
                { nombre: "Kunstmann Miel", precio: 3800 },
                { nombre: "Kunstmann Torobayo", precio: 3900 },
                { nombre: "Austral Calafate", precio: 4200 },
                { nombre: "Budweiser 500ml", precio: 3000 },
                { nombre: "Coors Light 500ml", precio: 3100 },
                { nombre: "Stella Artois 330ml", precio: 3400 },
                { nombre: "Becker 500ml", precio: 2500 },
                { nombre: "Royal Guard 500ml", precio: 2900 },
                { nombre: "Sol 330ml", precio: 3200 },
                { nombre: "Baltica 500ml", precio: 2000 },
                { nombre: "Quilmes 500ml", precio: 3000 }
            ],
            "Vinos": [
                { nombre: "Cabernet Sauvignon Copa", precio: 3500 },
                { nombre: "Merlot Copa", precio: 3500 },
                { nombre: "Carmenere Copa", precio: 3700 },
                { nombre: "Pinot Noir Copa", precio: 4000 },
                { nombre: "Syrah Copa", precio: 4200 },
                { nombre: "Espumante Brut", precio: 4500 },
                { nombre: "Espumante Demi Sec", precio: 4500 },
                { nombre: "Rose Copa", precio: 3800 },
                { nombre: "Vino Blanco Sauvignon Blanc", precio: 3600 },
                { nombre: "Vino Blanco Chardonnay", precio: 3700 },
                { nombre: "Blend Tinto", precio: 4100 },
                { nombre: "Blend Blanco", precio: 3900 },
                { nombre: "Vino de la Casa Copa", precio: 3000 },
                { nombre: "Reservado Cabernet", precio: 5000 },
                { nombre: "Gran Reserva", precio: 8000 }
            ]
        },
        food: {
            "Hamburguesas": [
                { nombre: "Clásica", precio: 5500 },
                { nombre: "Queso Cheddar", precio: 6000 },
                { nombre: "Doble Carne", precio: 7500 },
                { nombre: "BBQ Bacon", precio: 8000 },
                { nombre: "Vegetariana", precio: 6500 },
                { nombre: "Pollo Crispy", precio: 7000 },
                { nombre: "Churrasquera", precio: 7800 },
                { nombre: "Italiana", precio: 7200 },
                { nombre: "Texana", precio: 7900 },
                { nombre: "Hawaiana", precio: 7400 },
                { nombre: "A lo Pobre", precio: 8200 },
                { nombre: "Blue Cheese", precio: 8500 },
                { nombre: "Mexicana", precio: 7700 },
                { nombre: "Serrana", precio: 7800 },
                { nombre: "Gourmet", precio: 9000 }
            ],
            "Pizzas": [
                { nombre: "Margarita", precio: 6000 },
                { nombre: "Napolitana", precio: 6500 },
                { nombre: "Hawaiana", precio: 6800 },
                { nombre: "Pepperoni", precio: 7000 },
                { nombre: "Vegetariana", precio: 6500 },
                { nombre: "4 Quesos", precio: 7500 },
                { nombre: "BBQ Chicken", precio: 7800 },
                { nombre: "Mariscos", precio: 9000 },
                { nombre: "Prosciutto", precio: 8500 },
                { nombre: "Chorizo", precio: 7200 },
                { nombre: "Italiana", precio: 7700 },
                { nombre: "Fugazza", precio: 8000 },
                { nombre: "Aceitunas Negras", precio: 7400 },
                { nombre: "Champiñón", precio: 7100 },
                { nombre: "Especial de la Casa", precio: 9500 }
            ]
        }
    };

    let categoriaActual = "drink";
    let subcategoriaActual = "";
    let subcategorias = [];

    function cargarSubcategorias(categoria) {
        subcategoryMenu.innerHTML = "";
        subcategorias = Object.keys(productos[categoria]);

        subcategorias.forEach((sub, index) => {
            const btn = document.createElement("button");
            btn.textContent = sub;
            btn.classList.add("subcategory-btn");
            if (index === 0) btn.classList.add("active");
            btn.addEventListener("click", () => {
                cambiarSubcategoria(sub);
            });
            subcategoryMenu.appendChild(btn);
        });

        cambiarSubcategoria(subcategorias[0]);
    }

    function cambiarSubcategoria(sub) {
        subcategoriaActual = sub;
        document.querySelectorAll(".subcategory-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".subcategory-btn").forEach(b => {
            if (b.textContent === sub) b.classList.add("active");
        });

        productList.innerHTML = "";
        productos[categoriaActual][sub].forEach(prod => {
            const item = document.createElement("div");
            item.classList.add("product-item");
            item.innerHTML = `<span>${prod.nombre}</span><span class="precio">$${prod.precio.toLocaleString("es-CL")}</span>`;
            productList.appendChild(item);
        });

        productList.scrollTop = 0; // Reset scroll al cambiar
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            categoryBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            categoriaActual = btn.dataset.category;
            cargarSubcategorias(categoriaActual);
        });
    });

    // Scroll automático a subcategorías siguientes/anteriores
    productList.addEventListener("wheel", (e) => {
        const atBottom = productList.scrollTop + productList.clientHeight >= productList.scrollHeight - 5;
        const atTop = productList.scrollTop <= 0;

        if (e.deltaY > 0 && atBottom) {
            let idx = subcategorias.indexOf(subcategoriaActual);
            if (idx < subcategorias.length - 1) {
                cambiarSubcategoria(subcategorias[idx + 1]);
            }
        } 
        else if (e.deltaY < 0 && atTop) {
            let idx = subcategorias.indexOf(subcategoriaActual);
            if (idx > 0) {
                cambiarSubcategoria(subcategorias[idx - 1]);
            }
        }
    });

    cargarSubcategorias(categoriaActual);
});
