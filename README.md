# 📰 News Portal App

Una aplicación completa de noticias que combina NewsAPI con scraping local, construida con Next.js 15, TypeScript, MongoDB y Docker.

## ✨ Características

- 🌍 **API Externa**: Integración con NewsAPI.org para noticias internacionales
- 🔍 **Scraping Web**: Extracción de noticias de fuentes españolas (El País, El Mundo, 20 Minutos, El Economista)
- 🔄 **Sistema Híbrido**: Combina ambas fuentes evitando duplicación de noticias
- 📊 **Dashboard Completo**: Estadísticas y gestión de fuentes de datos
- 🎨 **UI Moderna**: Interfaz con Tailwind CSS y shadcn/ui
- 🐳 **Docker Ready**: Configuración completa para producción y desarrollo
- 🔐 **Base de Datos**: MongoDB con modelos optimizados utilizando Mongoose
- 🚀 **API REST**: Endpoints completos para CRUD y gestión

## 🛠️ Desarrollo Local

### Sin Docker

```powershell
# Instalar dependencias
npm install

# Configurar MongoDB local
# MONGODB_URI=mongodb://localhost:27017/newsapi

# Ejecutar en desarrollo
npm run dev
```

## 🏗️ Arquitectura

### Tecnologías

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Scraping**: Cheerio
- **API Externa**: NewsAPI.org
- **Contenedores**: Docker, Docker Compose

### Estructura de Servicios

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │◄──►│    MongoDB      │
│   (Puerto 9002) │    │  (Puerto 27017) │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│    NewsAPI      │    │  Web Scraping   │
│  (API Externa)  │    │ (Fuentes Locales)│
└─────────────────┘    └─────────────────┘
```

## 📱 Funcionalidades

### Dashboard
- Estadísticas en tiempo real
- Estado de servicios
- Métricas de scraping

### Gestión de Noticias
- Navegación por categorías
- Búsqueda híbrida
- Listado con paginación infinita
- Favoritos
- Búsqueda específica
- Diferenciación de noticias por medios españoles o internacionales

### Perfil personal
- Gestionar tus noticias favoritas
- Gestionar tu información
- Modo claro y oscuro seleccionables

### Administración
- CRUD de fuentes de datos
- Configuración de scrapers
- Gestión de selectores CSS para Scraping

### APIs Disponibles

#### Consulta
- `GET /api/news` - Noticias de NewsAPI
- `GET /api/scraped-items` - Artículos scrapeados
- `GET /api/datasources` - Fuentes de datos
- `GET /api/health` - Estado del sistema

#### Modificación
- `POST /api/datasources` - Crear fuente
- `PUT /api/datasources/[id]` - Actualizar fuente
- `DELETE /api/datasources/[id]` - Eliminar fuente
- `POST /api/datasources/[id]/scrape` - Ejecutar scraping
- `POST /api/scraped-items/[id]/enrich` - Enriquecer artículo (sin terminar)

### Fuentes de Scraping Predefinidas

- **El País**: Configuración optimizada para artículos
- **El Mundo**: Selectores específicos
- **20 Minutos**: Extracción automática
- **El Economista**: Noticias de economía

## 📊 Monitoreo

### Health Checks

- **Aplicación**: Conectividad HTTP y base de datos
- **MongoDB**: Disponibilidad del servicio
- **Intervalos**: 30 segundos con 5 reintentos

## 📝 Desarrollo

### Estructura del Proyecto

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── dashboard/      # Dashboard
│   ├── data/          # Página de noticias
│   └── datasources/   # Gestión de fuentes
├── components/         # Componentes React
├── lib/               # Utilidades y modelos
├── services/          # Servicios de datos
└── types/             # Tipos TypeScript
```

### Añadir Nueva Fuente de Scraping

1. Crear configuración en `scrapingService.ts`
2. Definir selectores CSS específicos
3. Probar con el scraper genérico
4. Añadir a la lista predefinida

### Extender API

1. Crear nuevo endpoint en `src/app/api/`
2. Definir tipos en `src/types/`
3. Añadir validación con Zod
4. Documentar en swagger (opcional)