// --- CONFIGURACIÓN ---
const API_URL = 'https://api-swa.onrender.com/api/carta';
const DRINK_CATEGORIES = ["Botellas", "Cervezas", "Coctelería", "Degustaciones", "Gin", "Licores", "Pisco", "Ron", "Sin alcohol", "Tequila", "Vinos & Espumantes", "Vodka", "Whisky"];
const FOOD_CATEGORIES = ["Para comenzar", "Para compartir", "Pizzas", "Sushi Especial", "Dulce Final"];

// --- VARIABLES GLOBALES ---
let menuObserver;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', main);

async function main() {
    setupTheme();
    setupTableNumber();
    menuObserver = createIntersectionObserver();

    const loadingEl = document.getElementById('loading');
    loadingEl.classList.remove('hidden'); // Mostrar loading

    try {
        const rawData = await fetchData();
        const menuData = transformData(rawData);

        setupEventListeners(menuData);
        handleGroupClick('Drink', menuData);

    } catch (error) {
        console.error("Error al cargar el menú:", error);
        document.getElementById('productos-container').innerHTML = `<p class="text-center text-red-500">No se pudo cargar el menú.</p>`;
    } finally {
        loadingEl.classList.add('hidden'); // Ocultar loading
    }
}

// --- MANEJO DE DATOS CON CACHE ---
async function fetchData() {
    const cacheKey = 'menuData';
    const cacheTimeKey = 'menuDataTime';
    const now = Date.now();
    const cacheTTL = 1000 * 60 * 60; // 1 hora

    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cachedData && cachedTime && (now - cachedTime < cacheTTL)) {
        return JSON.parse(cachedData);
    }

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
    const data = await response.json();

    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheTimeKey, now);

    return data;
}
