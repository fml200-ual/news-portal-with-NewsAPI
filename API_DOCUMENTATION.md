# 📰 Studio News API - Documentación Completa

## 🎯 Resumen

La API de Studio News está completamente documentada con **Swagger/OpenAPI 3.0** con formato profesional y diseño moderno. Toda la documentación está disponible en:

- **🌐 UI Interactiva**: http://localhost:3000/docs
- **📄 Especificación JSON**: http://localhost:3000/api/docs

## ✨ Características del Formato Mejorado

### 🎨 **Diseño Visual Profesional**
- **Header gradiente** con información de la API
- **Cards organizadas** por categorías con emojis
- **Colores diferenciados** por métodos HTTP (GET, POST, PUT, DELETE)
- **Animaciones sutiles** en hover y transiciones
- **Tipografía moderna** y legible

### 📱 **Responsive Design**
- **Optimizado para móviles** y tablets
- **Layout adaptativo** según el tamaño de pantalla
- **Navegación intuitiva** en todos los dispositivos

### 🔍 **Funcionalidades Avanzadas**
- **Filtro de búsqueda** en tiempo real
- **Try it out** habilitado para pruebas
- **Ejemplos detallados** en peticiones y respuestas
- **Deep linking** para compartir enlaces específicos
- **Documentación en español** con emojis descriptivos

## 🗂️ Endpoints Documentados

### 🗂️ **DataSources (Fuentes de Datos)**
Gestión completa de fuentes para web scraping (sitios web, APIs, URLs específicas)

- `GET /api/datasources` - 📋 Obtener todas las fuentes de datos
- `POST /api/datasources` - 🆕 Crear nueva fuente de datos  
- `GET /api/datasources/[id]` - 🔍 Obtener fuente específica
- `PUT /api/datasources/[id]` - ✏️ Actualizar fuente de datos
- `DELETE /api/datasources/[id]` - 🗑️ Eliminar fuente de datos
- `POST /api/datasources/[id]/scrape` - 🚀 Ejecutar scraping de una fuente

### � **ScrapedItems (Artículos Extraídos)**
CRUD completo de contenido extraído mediante scraping con enriquecimiento IA

- `GET /api/scraped-items` - 📋 Obtener artículos extraídos con filtros
- `GET /api/scraped-items/[id]` - 🔍 Obtener artículo específico
- `PUT /api/scraped-items/[id]` - ✏️ Actualizar artículo
- `DELETE /api/scraped-items/[id]` - 🗑️ Eliminar artículo
- `POST /api/scraped-items/[id]/enrich` - 🤖 Enriquecer artículo con IA

### 📰 **News (Noticias NewsAPI)**
Integración con NewsAPI para noticias internacionales con sistema de caché optimizado

- `GET /api/news` - 📰 Obtener noticias internacionales
- `POST /api/news` - ⭐ Marcar artículo como favorito

### ⭐ **Favorites (Favoritos)**
Sistema de gestión de artículos favoritos personalizado por usuario

- `GET /api/news/favorites` - 📋 Obtener artículos favoritos
- `POST /api/news/favorites` - ➕ Añadir artículo a favoritos
- `DELETE /api/news/favorites` - ➖ Eliminar artículo de favoritos

### 👤 **User (Usuario)**
Gestión de perfiles y preferencias personalizadas de configuración

- `GET /api/user/preferences` - ⚙️ Obtener preferencias del usuario
- `PUT /api/user/preferences` - 🔧 Actualizar preferencias del usuario

### 🔐 **Authentication (Autenticación)**
Registro de usuarios y gestión de sesiones seguras con NextAuth

- `POST /api/auth/register` - 📝 Registrar nuevo usuario

### 🏥 **Health (Sistema)**
Endpoints de monitoreo, salud y estado del sistema

- `GET /api/health` - 💚 Verificar estado del sistema

## 🎯 Características Avanzadas de la Documentación

### ✅ **Formato Profesional Implementado**
- **📊 Información detallada** de cada endpoint con casos de uso
- **🎨 Esquemas visuales** con colores y emojis descriptivos
- **📝 Ejemplos completos** de peticiones y respuestas
- **🔒 Indicadores de autenticación** para endpoints protegidos
- **📱 Diseño responsive** optimizado para todos los dispositivos
- **🎯 Organización por tags** con descripciones detalladas
- **🔍 Filtros de búsqueda** en tiempo real
- **⚡ Try it out** habilitado para pruebas directas

### 🏗️ **Esquemas Detallados**
- `DataSource`: Fuentes de datos para scraping con configuración avanzada
- `DataSourceInput`: Esquema de entrada para crear fuentes
- `ScrapedItem`: Artículos extraídos con metadatos completos
- `Article`: Noticias desde NewsAPI con información enriquecida
- `UserPreferences`: Configuración personalizada de usuario
- `Error`: Respuestas de error estandarizadas y descriptivas

### 🔑 **Autenticación Documentada**
- **Tipo**: Session-based authentication (NextAuth)
- **Método**: Cookie `next-auth.session-token`
- **Indicador**: 🔒 en endpoints que requieren autenticación
- **Manejo de errores**: Respuestas 401 documentadas

### �️ **Parámetros y Filtros**
- **📄 Paginación**: `page`, `pageSize` con validación
- **🔍 Búsqueda**: `q` para términos específicos
- **🏷️ Filtros**: `category`, `type`, `status`, `sentiment`
- **🔄 Control de Caché**: `refresh` para actualización forzada

## 🌐 URLs de Acceso

### Desarrollo (Puerto 3000)
- **📚 Swagger UI**: http://localhost:3000/docs
- **📄 JSON Spec**: http://localhost:3000/api/docs

### Producción
- **📚 Swagger UI**: https://studio-news.vercel.app/docs
- **📄 JSON Spec**: https://studio-news.vercel.app/api/docs

## 💻 Tecnologías y Características

### 🛠️ **Stack Tecnológico**
- **Framework**: Next.js 15 con App Router
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: NextAuth.js
- **Scraping**: Puppeteer
- **IA**: Google Genkit
- **Documentación**: Swagger/OpenAPI 3.0
- **UI**: Tailwind CSS + CSS personalizado

### 🎨 **Mejoras Visuales**
- **Gradientes**: Headers y botones con gradientes atractivos
- **Animaciones**: Transiciones suaves en hover
- **Colores semánticos**: Verde para GET, Azul para POST, etc.
- **Tipografía**: Fuente moderna y legible
- **Iconografía**: Emojis descriptivos en toda la documentación

## 🚀 Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La documentación estará disponible en:
# 📚 http://localhost:3000/docs (UI Interactiva)
# 📄 http://localhost:3000/api/docs (JSON Spec)
```

## 📈 Próximas Mejoras

- [ ] 🌐 Internacionalización (i18n) para múltiples idiomas
- [ ] 📊 Dashboard de métricas de uso de la API
- [ ] 🔔 Documentación de webhooks y notificaciones
- [ ] 📝 Guías de integración paso a paso
- [ ] 🧪 Ejemplos de código en múltiples lenguajes
- [ ] 📹 Videos tutoriales integrados
- [ ] 🔒 Documentación de rate limiting y quotas

---

## 🎉 Resultado Final

La documentación de la API ahora cuenta con:

✅ **20+ endpoints** completamente documentados  
✅ **Diseño profesional** con gradientes y animaciones  
✅ **Organización visual** por categorías con emojis  
✅ **Ejemplos detallados** para todas las operaciones  
✅ **Try it out** funcional para pruebas en vivo  
✅ **Responsive design** para todos los dispositivos  
✅ **Filtros de búsqueda** en tiempo real  
✅ **Autenticación** claramente documentada  

¡La API está lista para ser utilizada por desarrolladores con una experiencia de documentación de nivel profesional! 🚀
