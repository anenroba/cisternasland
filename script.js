document.addEventListener("DOMContentLoaded", async () => {
    const menuContainer = document.getElementById("menu-container");
    const subcategoryContainer = document.getElementById("subcategory-container");
    const toggleThemeBtn = document.getElementById("toggle-theme");

    let currentTheme = localStorage.getItem("theme") || "light";
    document.body.classList.add(`${currentTheme}-theme`);

    toggleThemeBtn.addEventListener("click", () => {
        document.body.classList.remove(`${currentTheme}-theme`);
        currentTheme = currentTheme === "light" ? "dark" : "light";
        document.body.classList.add(`${currentTheme}-theme`);
        localStorage.setItem("theme", currentTheme);
    });

    try {
        const response = await fetch("https://smartmenu.cl/api/carta/5");
        const data = await response.json();

        // Validar si existen categorías
        if (!data.categorias || !Array.isArray(data.categorias) || data.categorias.length === 0) {
            menuContainer.innerHTML = "<p class='error'>No hay categorías disponibles.</p>";
            return;
        }

        data.categorias.forEach(categoria => {
            const categoriaElement = document.createElement("div");
            categoriaElement.classList.add("categoria");
            categoriaElement.textContent = categoria.nombre;

            categoriaElement.addEventListener("click", () => {
                subcategoryContainer.innerHTML = "";

                // Validar si existen subcategorías en la categoría seleccionada
                if (!categoria.subcategorias || !Array.isArray(categoria.subcategorias) || categoria.subcategorias.length === 0) {
                    subcategoryContainer.innerHTML = "<p class='error'>No hay subcategorías disponibles.</p>";
                    return;
                }

                categoria.subcategorias.forEach(subcategoria => {
                    const subcategoriaElement = document.createElement("div");
                    subcategoriaElement.classList.add("subcategoria");
                    subcategoriaElement.textContent = subcategoria.nombre;
                    subcategoryContainer.appendChild(subcategoriaElement);
                });
            });

            menuContainer.appendChild(categoriaElement);
        });
    } catch (error) {
        console.error("Error cargando el menú:", error);
        menuContainer.innerHTML = "<p class='error'>Error al cargar el menú.</p>";
    }
});
