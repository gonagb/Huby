// API base URL
const API_BASE_URL = '/api';

// Elementos del DOM
const loadingSpinner = document.getElementById('loadingSpinner');
const coworkingDetail = document.getElementById('coworkingDetail');
const errorMessage = document.getElementById('errorMessage');

// Inicializar la página
document.addEventListener('DOMContentLoaded', function () {
  loadCoworkingDetail();
});

async function loadCoworkingDetail() {
  try {
    // Obtener el ID del coworking desde localStorage o URL
    const coworkingId = getCoworkingId();

    if (!coworkingId) {
      showError();
      return;
    }

    const response = await fetch(`${API_BASE_URL}/coworkings/${coworkingId}`);
    const data = await response.json();

    if (data.success) {
      renderCoworkingDetail(data.data);
    } else {
      showError();
    }
  } catch (error) {
    console.error('Error cargando detalles del coworking:', error);
    showError();
  }
}

function getCoworkingId() {
  // Primero intentar desde localStorage (desde la búsqueda)
  let coworkingId = localStorage.getItem('selectedCoworkingId');

  // Si no está en localStorage, intentar desde la URL
  if (!coworkingId) {
    const urlParams = new URLSearchParams(window.location.search);
    coworkingId = urlParams.get('id');
  }

  return coworkingId;
}

function renderCoworkingDetail(coworking) {
  loadingSpinner.style.display = 'none';
  coworkingDetail.style.display = 'block';

  // Actualizar el título de la página
  document.title = `${coworking.name} - Huby`;

  const featuredBadge = coworking.featured
    ? '<span class="featured-badge-large">⭐ Destacado</span>'
    : '';

  const rating = generateStars(coworking.rating);

  coworkingDetail.innerHTML = `
        <!-- Hero Section -->
        <section class="detail-hero">
            <div class="hero-image">
                <img src="${coworking.mainImage}" alt="${coworking.name}">
                <div class="hero-overlay">
                    <div class="container">
                        <div class="hero-content">
                            <div class="breadcrumb">
                                <a href="/">Inicio</a> > <span>Coworkings</span> > <span>${coworking.name}</span>
                            </div>
                            <h1>${coworking.name}</h1>
                            ${featuredBadge}
                            <div class="location-info">
                                <i class="fa fa-map-marker"></i>
                                <span>${coworking.address}, ${coworking.city}</span>
                            </div>
                            <div class="rating-info">
                                ${rating}
                                <span class="rating-text">${coworking.rating}/5 (${coworking.reviews} reseñas)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Main Content -->
        <section class="detail-content">
            <div class="container">
                <div class="row">
                    <!-- Content Column -->
                    <div class="col-lg-8">
                        <!-- Description -->
                        <div class="section-card">
                            <h2>Sobre este espacio</h2>
                            <p>${coworking.description}</p>
                        </div>

                        <!-- Gallery -->
                        ${renderGallery(coworking.images)}

                        <!-- Amenities -->
                        <div class="section-card">
                            <h2>Servicios y comodidades</h2>
                            <div class="amenities-grid">
                                ${coworking.amenities
    .map(
      amenity => `
                                    <div class="amenity-item">
                                        <i class="fa fa-check-circle"></i>
                                        <span>${amenity}</span>
                                    </div>
                                `
    )
    .join('')}
                            </div>
                        </div>

                        <!-- Location -->
                        <div class="section-card">
                            <h2>Ubicación</h2>
                            <div class="location-details">
                                <div class="address-info">
                                    <i class="fa fa-map-marker"></i>
                                    <div>
                                        <strong>${coworking.address}</strong><br>
                                        ${coworking.city}, ${coworking.postalCode}
                                    </div>
                                </div>
                                <div class="contact-info">
                                    <div class="contact-item">
                                        <i class="fa fa-phone"></i>
                                        <a href="tel:${coworking.phone}">${coworking.phone}</a>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fa fa-envelope"></i>
                                        <a href="mailto:${coworking.email}">${coworking.email}</a>
                                    </div>
                                    ${
  coworking.website
    ? `
                                        <div class="contact-item">
                                            <i class="fa fa-globe"></i>
                                            <a href="${coworking.website}" target="_blank">Sitio web</a>
                                        </div>
                                    `
    : ''
}
                                </div>
                            </div>
                            <!-- Placeholder para mapa -->
                            <div class="map-placeholder">
                                <i class="fa fa-map fa-2x"></i>
                                <p>Mapa interactivo próximamente</p>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="col-lg-4">
                        <!-- Pricing Card -->
                        <div class="pricing-card sticky-card">
                            <h3>Precios</h3>
                            <div class="pricing-options">
                                <div class="pricing-option">
                                    <div class="price-label">Pase diario</div>
                                    <div class="price">€${coworking.pricing.dayPass}</div>
                                </div>
                                <div class="pricing-option">
                                    <div class="price-label">Pase semanal</div>
                                    <div class="price">€${coworking.pricing.weekPass}</div>
                                </div>
                                <div class="pricing-option">
                                    <div class="price-label">Mesa flexible/mes</div>
                                    <div class="price">€${coworking.pricing.monthlyHotDesk}</div>
                                </div>
                                <div class="pricing-option">
                                    <div class="price-label">Mesa fija/mes</div>
                                    <div class="price">€${coworking.pricing.monthlyFixedDesk}</div>
                                </div>
                                <div class="pricing-option">
                                    <div class="price-label">Oficina privada/mes</div>
                                    <div class="price">€${coworking.pricing.privateOffice}</div>
                                </div>
                            </div>
                            <button class="btn btn-primary btn-reserve" onclick="showReservationModal()">
                                Reservar ahora
                            </button>
                            <div class="contact-buttons">
                                <a href="tel:${coworking.phone}" class="btn btn-outline">
                                    <i class="fa fa-phone"></i> Llamar
                                </a>
                                <a href="mailto:${coworking.email}" class="btn btn-outline">
                                    <i class="fa fa-envelope"></i> Email
                                </a>
                            </div>
                        </div>

                        <!-- Info Card -->
                        <div class="info-card">
                            <h3>Información</h3>
                            <div class="info-item">
                                <i class="fa fa-users"></i>
                                <span>Capacidad: ${coworking.capacity} personas</span>
                            </div>
                            <div class="info-item">
                                <i class="fa fa-clock-o"></i>
                                <span>Horarios:</span>
                            </div>
                            <div class="opening-hours">
                                ${renderOpeningHours(coworking.openingHours)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderGallery(images) {
  if (images.length <= 1) return '';

  return `
        <div class="section-card">
            <h2>Galería</h2>
            <div class="image-gallery">
                ${images
    .map(
      (image, index) => `
                    <div class="gallery-item" onclick="openImageModal('${image}', ${index})">
                        <img src="${image}" alt="Imagen ${index + 1}" loading="lazy">
                    </div>
                `
    )
    .join('')}
            </div>
        </div>
    `;
}

function renderOpeningHours(hours) {
  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  return Object.entries(hours)
    .map(
      ([day, time]) => `
        <div class="hours-item">
            <span class="day">${dayNames[day]}:</span>
            <span class="time">${time}</span>
        </div>
    `
    )
    .join('');
}

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

function showError() {
  loadingSpinner.style.display = 'none';
  errorMessage.style.display = 'block';
}

// Limpiar localStorage al cargar la página
window.addEventListener('beforeunload', function () {
  localStorage.removeItem('selectedCoworkingId');
});
