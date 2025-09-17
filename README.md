# 🏢 Huby - Buscador de Coworkings MVP

Un MVP funcional de buscador de coworkings en España, comenzando por Valencia. Construido con Node.js y Express para el backend, con un frontend interactivo que consume una API REST.

![Huby Preview](./Huby/assets/main/mainImage.jpeg)

## 🚀 Características

- ✅ **API REST completa** con endpoints para coworkings
- ✅ **Búsqueda y filtros avanzados** (texto, ciudad, precio, comodidades)
- ✅ **Página de inicio** con búsqueda en tiempo real
- ✅ **Página de detalle** con información completa de cada coworking
- ✅ **Diseño responsivo** para móviles y escritorio
- ✅ **Datos mock realistas** de coworkings de Valencia
- ✅ **Preparado para Vercel** con configuración de deployment
- ✅ **Arquitectura escalable** lista para funcionalidades futuras

## 📁 Estructura del Proyecto

```
Huby/
├── server/                 # Backend (Node.js + Express)
│   ├── index.js           # Servidor principal
│   ├── routes/            # Rutas de la API
│   └── data/              # Datos JSON mock
├── public/                # Frontend estático (generado)
│   ├── index.html         # Página principal
│   ├── coworking-detail.html  # Página de detalles
│   ├── js/                # JavaScript del frontend
│   ├── assets/            # Imágenes y recursos
│   └── styles.css         # Estilos CSS
├── scripts/               # Scripts de utilidad
├── package.json           # Configuración de Node.js
├── vercel.json           # Configuración de Vercel
└── README.md             # Esta documentación
```

## 🛠️ Instalación y Configuración Local

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### 1. Clonar e instalar dependencias

```bash
# Clonar el repositorio
git clone https://github.com/gonagb/Huby.git
cd Huby

# Instalar dependencias
npm install

# Copiar archivos estáticos
npm run build
```

### 2. Ejecutar en desarrollo

```bash
# Ejecutar el servidor con hot-reload
npm run dev

# El servidor estará disponible en:
# http://localhost:3000
```

### 3. Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con nodemon
npm run start    # Servidor de producción
npm run build    # Copiar archivos estáticos
npm test         # Ejecutar tests
npm run lint     # Linter de código
npm run format   # Formatear código con Prettier
```

## 🌐 Deployment en Vercel

### Opción 1: Deploy automático (Recomendado)

1. Fork este repositorio en tu cuenta de GitHub
2. Ve a [Vercel](https://vercel.com) e importa tu repositorio
3. Vercel detectará automáticamente la configuración
4. ¡Listo! Tu app estará disponible en una URL pública

### Opción 2: Deploy manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Variables de entorno (Opcional)

Puedes configurar estas variables en Vercel:

```env
NODE_ENV=production
PORT=3000
```

## 📊 API Endpoints

### Base URL
- **Local:** `http://localhost:3000/api`
- **Producción:** `https://tu-app.vercel.app/api`

### Endpoints disponibles

#### 1. Listar coworkings
```http
GET /api/coworkings
```

**Parámetros de query opcionales:**
- `search` - Búsqueda por nombre/descripción
- `city` - Filtrar por ciudad
- `maxPrice` - Precio máximo por día
- `amenity` - Filtrar por comodidad específica
- `featured` - Solo destacados (`true`/`false`)
- `sort` - Ordenar por `name`, `price`, `rating`
- `limit` - Número de resultados (paginación)
- `offset` - Offset para paginación

**Ejemplo de uso:**
```bash
# Buscar coworkings con "wayco" en Valencia
curl "http://localhost:3000/api/coworkings?search=wayco&city=Valencia"

# Coworkings baratos (hasta €25/día) ordenados por precio
curl "http://localhost:3000/api/coworkings?maxPrice=25&sort=price"
```

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Wayco Valencia",
      "slug": "wayco-valencia",
      "shortDescription": "Coworking moderno en el centro de Valencia",
      "address": "Calle Gran Vía Marqués del Turia, 49, Valencia",
      "city": "Valencia",
      "rating": 4.8,
      "pricing": {
        "dayPass": 25
      },
      "featured": true
    }
  ],
  "pagination": {
    "total": 5,
    "offset": 0,
    "limit": 10,
    "hasMore": false
  }
}
```

#### 2. Obtener coworking por ID
```http
GET /api/coworkings/:id
```

**Ejemplo:**
```bash
curl "http://localhost:3000/api/coworkings/1"
```

#### 3. Obtener coworking por slug
```http
GET /api/coworkings/slug/:slug
```

**Ejemplo:**
```bash
curl "http://localhost:3000/api/coworkings/slug/wayco-valencia"
```

#### 4. Listar ciudades disponibles
```http
GET /api/cities
```

#### 5. Listar comodidades disponibles
```http
GET /api/amenities
```

## 🧪 Testing

```bash
# Ejecutar tests de la API
npm test

# Ejecutar tests con coverage
npm run test:coverage
```

### Tests incluidos:
- ✅ Endpoints básicos de la API
- ✅ Filtros y búsqueda
- ✅ Validación de parámetros
- ✅ Manejo de errores

## 🎨 Personalización

### Agregar nuevos coworkings

Edita el archivo `server/data/coworkings.json`:

```json
{
  "id": 6,
  "name": "Tu Coworking",
  "slug": "tu-coworking",
  "description": "Descripción completa...",
  "shortDescription": "Descripción corta",
  "address": "Dirección completa",
  "city": "Valencia",
  "coordinates": {
    "lat": 39.4699,
    "lng": -0.3763
  },
  "amenities": ["WiFi", "Café", "Salas de reuniones"],
  "pricing": {
    "dayPass": 20,
    "weekPass": 85,
    "monthlyHotDesk": 150,
    "monthlyFixedDesk": 220,
    "privateOffice": 380
  },
  "featured": false
}
```

### Personalizar estilos

Los estilos están en `public/styles.css` usando variables CSS:

```css
:root {
  --success-500: #3db357;  /* Color principal */
  --neutral-800: #272727;  /* Color de texto */
  /* Personaliza estos valores */
}
```

## 🔧 Desarrollo y Contribución

### Estructura de desarrollo

1. **Backend (`server/`)**: API REST con Express
2. **Frontend (`public/`)**: HTML, CSS y JavaScript vanilla
3. **Build process**: Script que copia archivos desde `Huby/` a `public/`

### Próximas funcionalidades

- [ ] Sistema de reservas funcional
- [ ] Integración con mapas (Google Maps/OpenStreetMap)
- [ ] Sistema de reseñas y comentarios
- [ ] Autenticación de usuarios
- [ ] Dashboard para propietarios de coworkings
- [ ] Filtros avanzados (WiFi speed, noise level, etc.)
- [ ] Comparador de precios
- [ ] Sistema de notificaciones

### Contribuir al proyecto

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 🐛 Problemas Conocidos

- Las imágenes de la galería abren en nueva pestaña (modal pendiente)
- El mapa es un placeholder (integración pendiente)
- Sistema de reservas es un mock (backend real pendiente)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollo:** Huby Team
- **Diseño original:** Basado en coworkings reales de Valencia

## 📞 Soporte

¿Problemas o preguntas? Abre un issue en GitHub o contacta al equipo.

---

**¡Gracias por usar Huby! 🚀**