const fs = require('fs');
const path = require('path');

// Cargar datos de coworkings
const coworkingsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, './data/coworkings.json'), 'utf8')
);

// Función para filtrar coworkings
function filterCoworkings(req) {
  let filteredCoworkings = [...coworkingsData];
  const { search, city, maxPrice, amenity, featured, sort } = req.query;

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
      coworking.amenities.some(
        a =>
          a.name.toLowerCase().includes(amenity.toLowerCase()) ||
          a.icon.toLowerCase().includes(amenity.toLowerCase())
      )
    );
  }

  // Filtro por destacados
  if (featured === 'true') {
    filteredCoworkings = filteredCoworkings.filter(coworking => coworking.featured);
  }

  // Ordenamiento
  if (sort) {
    filteredCoworkings.sort((a, b) => {
      switch (sort.toLowerCase()) {
      case 'price':
        return a.pricing.dayPass - b.pricing.dayPass;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
      }
    });
  }

  return filteredCoworkings;
}

// Función principal que maneja todas las rutas de coworkings
module.exports = (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, method } = req;

    // Limpiar la URL y obtener las partes del path
    const urlParts = url.split('?')[0].split('/').filter(Boolean);

    // GET /api/coworkings
    if (
      method === 'GET' &&
      urlParts.length === 2 &&
      urlParts[0] === 'api' &&
      urlParts[1] === 'coworkings'
    ) {
      const filteredCoworkings = filterCoworkings(req);
      const { limit, offset } = req.query;

      // Paginación
      let paginatedResults = filteredCoworkings;
      let paginationInfo = {
        total: filteredCoworkings.length,
      };

      if (limit) {
        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset) || 0;
        paginatedResults = filteredCoworkings.slice(offsetNum, offsetNum + limitNum);

        paginationInfo = {
          total: filteredCoworkings.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < filteredCoworkings.length,
        };
      }

      return res.json({
        success: true,
        data: paginatedResults,
        pagination: paginationInfo,
      });
    }

    // GET /api/coworkings/:id
    if (
      method === 'GET' &&
      urlParts.length === 3 &&
      urlParts[0] === 'api' &&
      urlParts[1] === 'coworkings'
    ) {
      const id = urlParts[2];

      // Validar que el ID es un número
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      const coworking = coworkingsData.find(c => c.id === parseInt(id));

      if (!coworking) {
        return res.status(404).json({
          success: false,
          message: 'Coworking no encontrado',
        });
      }

      return res.json({
        success: true,
        data: coworking,
      });
    }

    // GET /api/coworkings/slug/:slug
    if (
      method === 'GET' &&
      urlParts.length === 4 &&
      urlParts[0] === 'api' &&
      urlParts[1] === 'coworkings' &&
      urlParts[2] === 'slug'
    ) {
      const slug = urlParts[3];
      const coworking = coworkingsData.find(c => c.slug === slug);

      if (!coworking) {
        return res.status(404).json({
          success: false,
          message: 'Coworking no encontrado',
        });
      }

      return res.json({
        success: true,
        data: coworking,
      });
    }

    // GET /api/cities
    if (
      method === 'GET' &&
      urlParts.length === 2 &&
      urlParts[0] === 'api' &&
      urlParts[1] === 'cities'
    ) {
      const cities = [...new Set(coworkingsData.map(c => c.city))].sort();
      return res.json({
        success: true,
        data: cities,
      });
    }

    // GET /api/amenities
    if (
      method === 'GET' &&
      urlParts.length === 2 &&
      urlParts[0] === 'api' &&
      urlParts[1] === 'amenities'
    ) {
      const allAmenities = coworkingsData.reduce((acc, coworking) => {
        coworking.amenities.forEach(amenity => {
          if (!acc.find(a => a.name === amenity.name)) {
            acc.push(amenity);
          }
        });
        return acc;
      }, []);

      return res.json({
        success: true,
        data: allAmenities,
      });
    }

    // Ruta no encontrada
    res.status(404).json({
      success: false,
      message: 'API no encontrada',
    });
  } catch (error) {
    console.error('Error en API:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};
