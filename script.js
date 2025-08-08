// Set Tailwind CSS configuration
// This configuration extends the default theme with custom fonts and a color palette.
tailwind.config = {
    darkMode: 'class', // Enable dark mode based on 'dark' class on <html>
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'], // Custom font Inter
            },
            colors: {
                // Custom color palette for light and dark modes based on copper tones
                // Light mode colors
                lightBg: '#fdfaf6',
                lightCard: '#ffffff',
                lightText: '#4a3d3c',
                lightAccent: '#b87333',
                lightBorder: '#e0c9b0',

                // Dark mode colors
                darkBg: '#2a1a16',
                darkCard: '#3e2d29',
                darkText: '#f5e8da',
                darkAccent: '#e49b5c',
                darkBorder: '#5c4541',
            }
        }
    }
}

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const mainCategoryButtons = document.querySelectorAll('.main-category-btn');
    const subCategoryNav = document.getElementById('sub-category-nav');
    const menuItemsContainer = document.getElementById('menu-items-container');

    // --- Dark/Light Mode Logic ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.classList.add(savedTheme);
    } else {
        htmlElement.classList.add('dark'); // Default to dark mode
    }

    themeToggle.addEventListener('click', () => {
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            htmlElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.classList.remove('light');
            htmlElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // --- Menu Data Structure ---
    const menuData = {
        drinks: {
            mojitos: {
                name: 'Mojitos',
                items: [
                    { name: 'Mojito Clásico', description: 'Ron Blanco, jugo de limón, goma y menta', price: '$6.000', image: 'https://placehold.co/150x150/e2e8f0/1e293b?text=Mojito+Clásico' },
                    { name: 'Mojito Coco', description: 'Ron malibu coconut, jugo de limón, goma, curaçao y menta', price: '$7.000', image: 'https://placehold.co/150x150/cbd5e1/1e293b?text=Mojito+Coco' },
                    { name: 'Mojito Ice', description: 'Ron Blanco, jugo de limón, goma, menta y Mistral ice', price: '$8.200', image: 'https://placehold.co/150x150/d1d5db/1e293b?text=Mojito+Ice' },
                    { name: 'Mojito Jagermeister', description: 'Vodka, Jagermeister, jugo de limón y maracuyá, goma y...', price: '$7.500', image: 'https://placehold.co/150x150/94a3b8/1e293b?text=Mojito+Jager' },
                    { name: 'Mojito Manzana', description: 'Ron Blanco, jugo de manzana, limón, goma y menta', price: '$6.500', image: 'https://placehold.co/150x150/64748b/1e293b?text=Mojito+Manzana' }
                ]
            },
            cocteleria: {
                name: 'Coctelería',
                items: [
                    { name: 'Margarita', description: 'Tequila, triple sec, jugo de limón y sal', price: '$7.800', image: 'https://placehold.co/150x150/a78bfa/1e293b?text=Margarita' },
                    { name: 'Pisco Sour', description: 'Pisco, jugo de limón, jarabe de goma y amargo de angostura', price: '$6.500', image: 'https://placehold.co/150x150/c4b5fd/1e293b?text=Pisco+Sour' },
                    { name: 'Gin & Tonic', description: 'Gin, tónica y rodaja de limón/pepino', price: '$7.000', image: 'https://placehold.co/150x150/ddd6fe/1e293b?text=Gin+%26+Tonic' }
                ]
            },
            redbull: {
                name: 'Redbull',
                items: [
                    { name: 'Red Bull Clásico', description: 'Bebida energética original', price: '$3.500', image: 'https://placehold.co/150x150/fca5a5/1e293b?text=Red+Bull' },
                    { name: 'Red Bull Sugarfree', description: 'Bebida energética sin azúcar', price: '$3.500', image: 'https://placehold.co/150x150/f87171/1e293b?text=Red+Bull+SF' }
                ]
            }
        },
        food: {
            main: {
                name: 'Comida',
                items: [
                    { name: 'Papas Fritas', description: 'Porción de papas fritas con salsa a elección', price: '$4.000', image: 'https://placehold.co/150x150/fdba74/1e293b?text=Papas+Fritas' },
                    { name: 'Hamburguesa Clásica', description: 'Carne, queso, tomate, lechuga y salsa especial', price: '$9.500', image: 'https://placehold.co/150x150/fb923c/1e293b?text=Hamburguesa' },
                    { name: 'Tacos de Carnitas', description: 'Tacos de cerdo desmenuzado con cebolla y cilantro', price: '$8.000', image: 'https://placehold.co/150x150/fcd34d/1e293b?text=Tacos' },
                    { name: 'Ensalada César', description: 'Lechuga romana, crutones, queso parmesano y aderezo César', price: '$7.000', image: 'https://placehold.co/150x150/fde047/1e293b?text=Ensalada' }
                ]
            }
        }
    };

    let currentMainCategory = 'drinks';

    function renderSubCategoryButtons(mainCategory) {
        subCategoryNav.innerHTML = '';
        const subCategories = menuData[mainCategory];
        for (const key in subCategories) {
            const subCat = subCategories[key];
            const button = `
                <button class="sub-category-btn py-2 px-4 rounded-lg text-sm font-medium hover:bg-lightAccent hover:text-white dark:hover:bg-darkAccent transition-all duration-200 focus:outline-none" data-sub-category="${key}">
                    ${subCat.name}
                </button>
            `;
            subCategoryNav.insertAdjacentHTML('beforeend', button);
        }
        document.querySelectorAll('.sub-category-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.sub-category-btn').forEach(btn => btn.classList.remove('active', 'bg-lightAccent', 'text-white', 'dark:bg-darkAccent'));
                button.classList.add('active', 'bg-lightAccent', 'text-white', 'dark:bg-darkAccent');
                const targetSection = document.getElementById(`section-${button.dataset.subCategory}`);
                if (targetSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const mainNavHeight = document.getElementById('main-category-nav').offsetHeight;
                    const subNavHeight = document.getElementById('sub-category-nav').offsetHeight;
                    const totalOffset = headerHeight + mainNavHeight + subNavHeight + 20;
                    window.scrollTo({
                        top: targetSection.offsetTop - totalOffset,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function renderMenuItems(mainCategory) {
        menuItemsContainer.innerHTML = '';
        const subCategories = menuData[mainCategory];
        for (const key in subCategories) {
            const subCat = subCategories[key];
            let sectionHtml = `
                <section id="section-${key}" class="pt-6 pb-4">
                    <h2 class="text-2xl font-bold mb-4 px-2">${subCat.name}</h2>
                    <div class="space-y-4">
            `;
            subCat.items.forEach(item => {
                sectionHtml += `
                        <div class="flex items-center bg-lightCard dark:bg-darkCard rounded-xl shadow-sm overflow-hidden p-3 transition-transform duration-200 hover:scale-[1.01] border border-lightBorder dark:border-darkBorder">
                            <img src="${item.image}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/cccccc/333333?text=No+Image';" alt="${item.name}" class="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover flex-shrink-0 mr-4">
                            <div class="flex-grow">
                                <h3 class="text-lg sm:text-xl font-semibold mb-1">${item.name}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${item.description}</p>
                                <p class="text-lightAccent dark:text-darkAccent font-bold text-base sm:text-lg">${item.price}</p>
                            </div>
                        </div>
                `;
            });
            sectionHtml += `</div></section>`;
            menuItemsContainer.insertAdjacentHTML('beforeend', sectionHtml);
        }
    }

    mainCategoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            mainCategoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentMainCategory = button.dataset.mainCategory;
            renderSubCategoryButtons(currentMainCategory);
            renderMenuItems(currentMainCategory);
            const firstSubCategoryBtn = document.querySelector('.sub-category-btn');
            if (firstSubCategoryBtn) {
                firstSubCategoryBtn.classList.add('active', 'bg-lightAccent', 'text-white', 'dark:bg-darkAccent');
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-150px 0px -50% 0px',
        threshold: 0
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id.replace('section-', '');
                if (menuData[currentMainCategory] && menuData[currentMainCategory][sectionId]) {
                    document.querySelectorAll('.sub-category-btn').forEach(btn => btn.classList.remove('active', 'bg-lightAccent', 'text-white', 'dark:bg-darkAccent'));
                    const activeSubBtn = document.querySelector(`.sub-category-btn[data-sub-category="${sectionId}"]`);
                    if (activeSubBtn) {
                        activeSubBtn.classList.add('active', 'bg-lightAccent', 'text-white', 'dark:bg-darkAccent');
                    }
                }
            }
        });
    }, observerOptions);

    function observeSections() {
        document.querySelectorAll('#menu-items-container section').forEach(section => {
            observer.observe(section);
        });
    }

    // --- Initial Load ---
    document.querySelector('.main-category-btn[data-main-category="drinks"]').classList.add('active');
    renderSubCategoryButtons('drinks');
    renderMenuItems('drinks');
    const firstSubCategoryBtnOnLoad = document.querySelector('.sub-category-btn');
    if (firstSubCategoryBtnOnLoad) {
        firstSubCategoryBtnOnLoad.classList.add('active', 'bg-lightAccent', 'text-white', 'dark:bg-darkAccent');
    }
    observeSections();

    mainCategoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('#menu-items-container section').forEach(section => observer.unobserve(section));
            setTimeout(observeSections, 100);
        });
    });
});