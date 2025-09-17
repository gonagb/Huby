const express = require('express');
const path = require('path');
const coworkingsHandler = require('./api/coworkings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware para prevenir cache durante desarrollo
app.use((req, res, next) => {
  if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

// Servir archivos estáticos PRIMERO
app.use(express.static(path.join(__dirname, 'public')));

// API Routes - usar el handler de Vercel
app.all('/api/*', (req, res) => {
  coworkingsHandler(req, res);
});

// Ruta para SPA - servir index.html SOLO para rutas HTML que no sean archivos estáticos
app.get('*', (req, res) => {
  // No interceptar archivos CSS, JS, imágenes, etc.
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|svg)$/)) {
    return res.status(404).send('Archivo no encontrado');
  }
  console.log(`Serving SPA for: ${req.path}`);
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Solo iniciar servidor si no estamos en tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Huby ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
