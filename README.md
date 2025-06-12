# 📰 Studio News App

Una aplicación completa de noticias que combina NewsAPI con scraping local, construida con Next.js 15, TypeScript, MongoDB y Docker.

## ✨ Características

- 🌍 **API Externa**: Integración con NewsAPI.org para noticias internacionales
- 🔍 **Scraping Web**: Extracción de noticias de fuentes españolas (El País, El Mundo, 20 Minutos, El Economista)
- 🔄 **Sistema Híbrido**: Combina ambas fuentes con deduplicación inteligente
- 📊 **Dashboard Completo**: Estadísticas y gestión de fuentes de datos
- 🎨 **UI Moderna**: Interfaz con Tailwind CSS y shadcn/ui
- 🐳 **Docker Ready**: Configuración completa para producción y desarrollo
- 🔐 **Base de Datos**: MongoDB con modelos optimizados
- 🚀 **API REST**: Endpoints completos para CRUD y gestión

## 🚀 Inicio Rápido con Docker

### Prerrequisitos

- Docker Desktop instalado
- Al menos 2GB de RAM libre
- Puertos 3000 y 27017 disponibles

### 1. Configuración

```powershell
# Clonar el repositorio
git clone <tu-repo>
cd studio

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu NewsAPI key
```

### 2. Ejecutar con Docker

```powershell
# Iniciar todos los servicios
docker-compose up -d --build

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 3. Verificar

- **Aplicación**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **MongoDB**: localhost:27017

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

### Con Docker (Hot-reload)

```powershell
# Usar configuración de desarrollo
docker-compose -f docker-compose.dev.yml up -d --build
```

## 📋 Scripts de Gestión

### PowerShell (Windows)

```powershell
# Iniciar servicios
.\docker-manager.ps1 start

# Ver estado
.\docker-manager.ps1 status

# Ver logs
.\docker-manager.ps1 logs

# Detener servicios
.\docker-manager.ps1 stop

# Backup de base de datos
.\docker-manager.ps1 backup

# Ayuda
.\docker-manager.ps1 help
```

### Bash (Linux/macOS)

```bash
# Hacer ejecutable
chmod +x docker-manager.sh

# Iniciar servicios
./docker-manager.sh start

# Ver estado
./docker-manager.sh status
```

## 🏗️ Arquitectura

### Tecnologías

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Scraping**: Cheerio, Puppeteer
- **Externa**: NewsAPI.org
- **Contenedores**: Docker, Docker Compose

### Estructura de Servicios

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │◄──►│    MongoDB      │
│   (Puerto 3000) │    │  (Puerto 27017) │
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

### Administración
- CRUD de fuentes de datos
- Configuración de scrapers
- Enriquecimiento de artículos
- Gestión de selectores CSS

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
- `POST /api/scraped-items/[id]/enrich` - Enriquecer artículo

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos
MONGODB_URI=mongodb://admin:password123@mongodb:27017/newsapi?authSource=admin

# NewsAPI
NEXT_PUBLIC_NEWSAPI_KEY=tu_api_key_aqui

# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
PORT=3000
```

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

### Logs

```powershell
# Logs en tiempo real
docker-compose logs -f

# Logs específicos
docker-compose logs -f app
docker-compose logs -f mongodb

# Logs con timestamps
docker-compose logs -f -t
```

## 🔄 Backup y Restauración

### Crear Backup

```powershell
# Con script
.\docker-manager.ps1 backup

# Manual
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/newsapi?authSource=admin" --out=/tmp/backup
```

### Restaurar

```powershell
# Restaurar desde backup
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/newsapi?authSource=admin" /tmp/backup/newsapi
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Puerto en uso**:
   ```powershell
   # Cambiar puerto en docker-compose.yml
   ports:
     - "3001:3000"
   ```

2. **Memoria insuficiente**:
   - Aumentar memoria de Docker Desktop (4GB+)

3. **Base de datos no conecta**:
   ```powershell
   # Verificar logs
   docker-compose logs mongodb
   
   # Recrear volumen
   docker-compose down -v
   docker-compose up -d
   ```

4. **NewsAPI no funciona**:
   - Verificar API key en `.env.local`
   - Comprobar límites de la API

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

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 🔗 Enlaces Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Setup Guide](./DOCKER_SETUP.md)

---

## ✅ Estado del Proyecto

**🎯 Completado (8/8 tareas):**

- ✅ API de terceros externa (NewsAPI)
- ✅ Scraping de datos reales
- ✅ API REST de consulta
- ✅ API REST de modificación
- ✅ Listados en frontend
- ✅ Edición en frontend
- ✅ Dockerfile optimizado
- ✅ Docker Compose completo

**🚀 ¡Aplicación lista para producción!**
