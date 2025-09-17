const express = require('express');
const path = require('path');
const coworkingsHandler = require('./api/coworkings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - usar el handler de Vercel
app.all('/api/*', (req, res) => {
  coworkingsHandler(req, res);
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para SPA - servir index.html para todas las rutas que no sean API
app.get('*', (req, res) => {
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
