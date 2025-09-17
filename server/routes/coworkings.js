const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cargar datos de coworkings
const coworkingsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/coworkings.json'), 'utf8')
);

/**
 * GET /api/coworkings
 * Obtener lista de coworkings con filtros opcionales
 * Query parameters:
 * - search: búsqueda por nombre o descripción
 * - city: filtrar por ciudad
 * - maxPrice: precio máximo por día
 * - amenity: filtrar por comodidad específica
 * - featured: mostrar solo destacados (true/false)
 * - sort: ordenar por price, rating, name (default: name)
 * - limit: limitar número de resultados
 * - offset: offset para paginación
 */
router.get('/coworkings', (req, res) => {
  try {
    let filteredCoworkings = [...coworkingsData];

    // Aplicar filtros
    const { search, city, maxPrice, amenity, featured, sort, limit, offset } = req.query;

    // Filtro por búsqueda de texto
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCoworkings = filteredCoworkings.filter(
        coworking =>
          coworking.name.toLowerCase().includes(searchTerm) ||
          coworking.description.toLowerCase().includes(searchTerm) ||
          coworking.shortDescription.toLowerCase().includes(searchTerm) ||
          coworking.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro por ciudad
    if (city) {
      filteredCoworkings = filteredCoworkings.filter(
        coworking => coworking.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Filtro por precio máximo
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice);
      filteredCoworkings = filteredCoworkings.filter(
        coworking => coworking.pricing.dayPass <= maxPriceNum
      );
    }

    // Filtro por comodidad
    if (amenity) {
      filteredCoworkings = filteredCoworkings.filter(coworking =>
        coworking.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
      );
    }

    // Filtro por destacados
    if (featured !== undefined) {
      const isFeatured = featured.toLowerCase() === 'true';
      filteredCoworkings = filteredCoworkings.filter(
        coworking => coworking.featured === isFeatured
      );
    }

    // Ordenamiento
    if (sort) {
      switch (sort.toLowerCase()) {
      case 'price':
        filteredCoworkings.sort((a, b) => a.pricing.dayPass - b.pricing.dayPass);
        break;
      case 'rating':
        filteredCoworkings.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
      default:
        filteredCoworkings.sort((a, b) => a.name.localeCompare(b.name));
        break;
      }
    }

    // Paginación
    const totalResults = filteredCoworkings.length;
    const offsetNum = parseInt(offset) || 0;
    const limitNum = parseInt(limit) || totalResults;

    const paginatedResults = filteredCoworkings.slice(offsetNum, offsetNum + limitNum);

    // Respuesta con metadatos
    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: totalResults,
        offset: offsetNum,
        limit: limitNum,
        hasMore: offsetNum + limitNum < totalResults,
      },
      filters: {
        search,
        city,
        maxPrice,
        amenity,
        featured,
        sort,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/coworkings:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

/**
 * GET /api/coworkings/:id
 * Obtener detalles de un coworking específico
 */
router.get('/coworkings/:id', (req, res) => {
  try {
    const coworkingId = parseInt(req.params.id);

    if (isNaN(coworkingId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de coworking inválido',
      });
    }

    const coworking = coworkingsData.find(c => c.id === coworkingId);

    if (!coworking) {
      return res.status(404).json({
        success: false,
        message: 'Coworking no encontrado',
      });
    }

    res.json({
      success: true,
      data: coworking,
    });
  } catch (error) {
    console.error('Error en GET /api/coworkings/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

/**
 * GET /api/coworkings/slug/:slug
 * Obtener coworking por slug (URL amigable)
 */
router.get('/coworkings/slug/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    const coworking = coworkingsData.find(c => c.slug === slug);

    if (!coworking) {
      return res.status(404).json({
        success: false,
        message: 'Coworking no encontrado',
      });
    }

    res.json({
      success: true,
      data: coworking,
    });
  } catch (error) {
    console.error('Error en GET /api/coworkings/slug/:slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

/**
 * GET /api/cities
 * Obtener lista de ciudades disponibles
 */
router.get('/cities', (req, res) => {
  try {
    const cities = [...new Set(coworkingsData.map(c => c.city))].sort();

    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error('Error en GET /api/cities:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

/**
 * GET /api/amenities
 * Obtener lista de todas las comodidades disponibles
 */
router.get('/amenities', (req, res) => {
  try {
    const allAmenities = coworkingsData.flatMap(c => c.amenities);
    const uniqueAmenities = [...new Set(allAmenities)].sort();

    res.json({
      success: true,
      data: uniqueAmenities,
    });
  } catch (error) {
    console.error('Error en GET /api/amenities:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

module.exports = router;
