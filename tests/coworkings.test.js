const request = require('supertest');
const app = require('../dev-server');

describe('Coworkings API', () => {
  // Test básico de salud de la API
  describe('GET /api/coworkings', () => {
    it('should return all coworkings', async () => {
      const response = await request(app).get('/api/coworkings').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.length).toBe(12); // Ahora tenemos 12 coworkings

      // Verificar estructura básica del primer coworking
      const firstCoworking = response.body.data[0];
      expect(firstCoworking).toHaveProperty('id');
      expect(firstCoworking).toHaveProperty('name');
      expect(firstCoworking).toHaveProperty('city');
      expect(firstCoworking).toHaveProperty('pricing');
    });

    it('should filter by city', async () => {
      const response = await request(app).get('/api/coworkings?city=Valencia').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(c => c.city === 'Valencia')).toBe(true);
    });

    it('should filter by search term', async () => {
      const response = await request(app).get('/api/coworkings?search=wayco').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.some(c => c.name.toLowerCase().includes('wayco'))).toBe(true);
    });

    it('should filter by max price', async () => {
      const response = await request(app).get('/api/coworkings?maxPrice=25').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(c => c.pricing.dayPass <= 25)).toBe(true);
    });

    it('should filter by featured', async () => {
      const response = await request(app).get('/api/coworkings?featured=true').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(c => c.featured === true)).toBe(true);
    });

    it('should sort by price', async () => {
      const response = await request(app).get('/api/coworkings?sort=price').expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.data.map(c => c.pricing.dayPass);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should include pagination info', async () => {
      const response = await request(app).get('/api/coworkings?limit=2').expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('offset');
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/coworkings/:id', () => {
    it('should return specific coworking by ID', async () => {
      const response = await request(app).get('/api/coworkings/1').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('amenities');
      expect(response.body.data).toHaveProperty('openingHours');
    });

    it('should return 404 for non-existent coworking', async () => {
      const response = await request(app).get('/api/coworkings/999').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrado');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/coworkings/invalid').expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inválido');
    });
  });

  describe('GET /api/coworkings/slug/:slug', () => {
    it('should return coworking by slug', async () => {
      const response = await request(app).get('/api/coworkings/slug/wayco-valencia').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('wayco-valencia');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app).get('/api/coworkings/slug/non-existent').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cities', () => {
    it('should return list of cities', async () => {
      const response = await request(app).get('/api/cities').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toContain('Valencia');
    });
  });

  describe('GET /api/amenities', () => {
    it('should return list of amenities', async () => {
      const response = await request(app).get('/api/amenities').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent').expect(404);

      expect(response.body.message).toContain('API no encontrada');
    });
  });

  describe('Complex filtering', () => {
    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/coworkings?city=Valencia&maxPrice=30&sort=rating')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Todos deben ser de Valencia
      expect(response.body.data.every(c => c.city === 'Valencia')).toBe(true);

      // Todos deben tener precio <= 30
      expect(response.body.data.every(c => c.pricing.dayPass <= 30)).toBe(true);
    });

    it('should return empty array when no matches', async () => {
      const response = await request(app)
        .get('/api/coworkings?search=nonexistentcoworking')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });
});
