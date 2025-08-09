document.addEventListener("DOMContentLoaded", () => {

    // --- Función para inicializar eventos en elementos estáticos ---
    function initStaticEvents() {
        const btnGenerar = document.getElementById("btnGenerar");
        if (btnGenerar) {
            btnGenerar.addEventListener("click", generarQR);
        }
    }

    // --- Función para inicializar eventos en elementos dinámicos ---
    function initDynamicEvents() {
        const btnVolver = document.getElementById("btnVolver");
        if (btnVolver) {
            btnVolver.addEventListener("click", mostrarFormulario);
        }
    }

    // --- Mostrar formulario inicial ---
    function mostrarFormulario() {
        const app = document.getElementById("app");
        app.innerHTML = `
            <h1>Generar QR</h1>
            <input type="text" id="textoQR" placeholder="Escribe algo..." />
            <button id="btnGenerar">Generar QR</button>
        `;
        initStaticEvents();
    }

    // --- Generar QR y reemplazar HTML ---
    function generarQR() {
        const texto = document.getElementById("textoQR").value;
        if (!texto.trim()) {
            alert("Por favor escribe un texto");
            return;
        }

        // Guardar en localStorage
        localStorage.setItem("textoQR", texto);

        const app = document.getElementById("app");
        app.innerHTML = `
            <h1>Tu QR</h1>
            <div id="qr"></div>
            <button id="btnVolver">Volver</button>
        `;

        // Generar el QR
        new QRCode(document.getElementById("qr"), {
            text: texto,
            width: 128,
            height: 128
        });

        initDynamicEvents();
    }

    // --- Inicio ---
    mostrarFormulario();
});
