// API base URL
const API_BASE_URL = '/api';

// Estado de la aplicación
let allCoworkings = [];
let currentFilters = {
    search: '',
    city: '',
    maxPrice: '',
    sort: 'name'
};

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const coworkingsList = document.getElementById('coworkingsList');
const featuredCoworkings = document.getElementById('featuredCoworkings');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsCount = document.getElementById('resultsCount');
const cityFilter = document.getElementById('cityFilter');
const priceFilter = document.getElementById('priceFilter');
const sortFilter = document.getElementById('sortFilter');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadCities();
        await loadFeaturedCoworkings();
        setupEventListeners();
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        showError('Error cargando la aplicación');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Búsqueda
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Filtros
    cityFilter.addEventListener('change', handleFilterChange);
    priceFilter.addEventListener('change', handleFilterChange);
    sortFilter.addEventListener('change', handleFilterChange);

    // Búsqueda en tiempo real (con debounce)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (searchInput.value.trim()) {
                handleSearch();
            }
        }, 500);
    });
}

// Cargar ciudades para el filtro
async function loadCities() {
    try {
        const response = await fetch(`${API_BASE_URL}/cities`);
        const data = await response.json();
        
        if (data.success) {
            data.data.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                cityFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando ciudades:', error);
    }
}

// Cargar coworkings destacados
async function loadFeaturedCoworkings() {
    try {
        const response = await fetch(`${API_BASE_URL}/coworkings?featured=true&sort=rating`);
        const data = await response.json();
        
        if (data.success) {
            renderCoworkings(data.data, featuredCoworkings);
        }
    } catch (error) {
        console.error('Error cargando coworkings destacados:', error);
    }
}

// Manejar búsqueda
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    currentFilters.search = searchTerm;
    
    if (!searchTerm) {
        resultsSection.style.display = 'none';
        return;
    }

    await performSearch();
}

// Manejar cambios en filtros
function handleFilterChange() {
    currentFilters.city = cityFilter.value;
    currentFilters.maxPrice = priceFilter.value;
    currentFilters.sort = sortFilter.value;
    
    if (currentFilters.search || currentFilters.city || currentFilters.maxPrice) {
        performSearch();
    }
}

// Realizar búsqueda con filtros
async function performSearch() {
    showLoading(true);
    
    try {
        const params = new URLSearchParams();
        
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value) {
                params.append(key, value);
            }
        });

        const response = await fetch(`${API_BASE_URL}/coworkings?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            renderSearchResults(data);
        } else {
            showError(data.message || 'Error en la búsqueda');
        }
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        showError('Error realizando la búsqueda');
    } finally {
        showLoading(false);
    }
}

// Renderizar resultados de búsqueda
function renderSearchResults(data) {
    resultsSection.style.display = 'block';
    
    // Mostrar contador de resultados
    const count = data.data.length;
    const totalText = count === 1 ? '1 coworking encontrado' : `${count} coworkings encontrados`;
    resultsCount.textContent = totalText;
    
    // Renderizar coworkings
    renderCoworkings(data.data, coworkingsList);
    
    // Scroll suave a los resultados
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Renderizar lista de coworkings
function renderCoworkings(coworkings, container) {
    container.innerHTML = '';
    
    if (coworkings.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fa fa-search fa-3x"></i>
                <h3>No se encontraron resultados</h3>
                <p>Prueba con otros términos de búsqueda o filtros</p>
            </div>
        `;
        return;
    }
    
    coworkings.forEach(coworking => {
        const coworkingCard = createCoworkingCard(coworking);
        container.appendChild(coworkingCard);
    });
}

// Crear tarjeta de coworking
function createCoworkingCard(coworking) {
    const card = document.createElement('div');
    card.className = 'coworking-card';
    card.onclick = () => openCoworkingDetail(coworking.id);
    
    const featuredBadge = coworking.featured ? '<span class="featured-badge">Destacado</span>' : '';
    const rating = generateStars(coworking.rating);
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${coworking.mainImage}" alt="${coworking.name}" loading="lazy">
            ${featuredBadge}
        </div>
        <div class="card-content">
            <h3>${coworking.name}</h3>
            <p class="card-location">
                <i class="fa fa-map-marker"></i> ${coworking.address}
            </p>
            <p class="card-description">${coworking.shortDescription}</p>
            <div class="card-rating">
                ${rating}
                <span class="rating-text">${coworking.rating} (${coworking.reviews} reviews)</span>
            </div>
            <div class="card-amenities">
                ${coworking.amenities.slice(0, 3).map(amenity => 
                    `<span class="amenity-tag">${amenity}</span>`
                ).join('')}
                ${coworking.amenities.length > 3 ? `<span class="more-amenities">+${coworking.amenities.length - 3}</span>` : ''}
            </div>
            <div class="card-pricing">
                <span class="price-from">Desde</span>
                <span class="price">€${coworking.pricing.dayPass}</span>
                <span class="price-period">/día</span>
            </div>
        </div>
    `;
    
    return card;
}

// Generar estrellas para rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fa fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fa fa-star-half-o"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="fa fa-star-o"></i>';
    }
    
    return `<div class="stars">${starsHtml}</div>`;
}

// Abrir detalles del coworking
function openCoworkingDetail(coworkingId) {
    // Guardar el ID en localStorage para la página de detalle
    localStorage.setItem('selectedCoworkingId', coworkingId);
    
    // Redirigir a la página de detalle
    window.location.href = '/coworking-detail.html';
}

// Mostrar/ocultar loading spinner
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

// Mostrar error
function showError(message) {
    // Crear toast de error o mostrar en consola
    console.error(message);
    
    // TODO: Implementar un sistema de notificaciones más elegante
    alert(message);
}

// Utilidades
function formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(price);
}

// Export para testing (si aplica)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateStars,
        formatPrice
    };
}