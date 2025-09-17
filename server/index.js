const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const coworkingsRoutes = require('./routes/coworkings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y logging
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
    },
  })
);
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', coworkingsRoutes);

// Manejo de rutas API no encontradas (debe ir antes del catch-all)
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Ruta de API no encontrada' });
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para SPA - servir index.html para todas las rutas que no sean API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores global
app.use((error, req, res) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Solo iniciar servidor si no estamos en tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Huby ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
