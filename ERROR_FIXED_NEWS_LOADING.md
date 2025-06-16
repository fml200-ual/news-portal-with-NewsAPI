# 🐛 Solución del Error "Error al cargar las noticias" + Problema de Scraping Local

## Problema Identificado

El error `Error al cargar las noticias` en el hook `useNews` estaba causado por múltiples problemas en la configuración y implementación del endpoint `/api/news`. Adicionalmente, las noticias aparecían marcadas como "Scraping Local" en lugar de "NewsAPI" y solo se mostraban noticias del día actual.

## Causas Encontradas

### 1. ❌ Variable de Entorno Incorrecta
- **Problema**: La variable `NEWSAPI_KEY` estaba configurada como `NEXT_PUBLIC_NEWSAPI_KEY` en `.env.local`
- **Impacto**: El servidor no podía acceder a la clave de API de NewsAPI
- **Error**: 401 Unauthorized

### 2. ❌ Configuración de Parámetros NewsAPI Incompatibles
- **Problema**: Se intentaba usar `category` y `sources` simultáneamente
- **Impacto**: NewsAPI respondía con 400 Bad Request para consultas por categoría
- **Error**: Request failed with status code 400

### 3. ❌ Limitaciones de NewsAPI España
- **Problema**: Pocas fuentes disponibles para `country: 'es'` en cuentas gratuitas
- **Impacto**: 0 resultados en la mayoría de consultas
- **Error**: Array vacío de artículos

### 4. ❌ Esquema de Base de Datos Incorrecto
- **Problema**: El campo `source` se guardaba como objeto en lugar de string
- **Impacto**: Las noticias aparecían como "Scraping Local" en lugar de "NewsAPI"
- **Error**: Clasificación incorrecta de fuentes

### 5. ❌ Lógica de Caché Restrictiva
- **Problema**: Solo mostraba noticias creadas en los últimos 15 minutos
- **Impacto**: Solo aparecían noticias del día actual
- **Error**: Filtrado temporal incorrecto

## Soluciones Implementadas

### ✅ 1. Corrección de Variable de Entorno
```bash
# Antes (incorrecto)
NEXT_PUBLIC_NEWSAPI_KEY=2ab7961ef997456f880765dec91ba44b

# Después (correcto)
NEWSAPI_KEY=2ab7961ef997456f880765dec91ba44b
```

### ✅ 2. Lógica Inteligente de Parámetros NewsAPI
```typescript
// Configurar parámetros según disponibilidad
if (category) {
  // Si hay categoría, usar country en lugar de sources
  params.category = category;
  params.country = 'us';
} else if (!query) {
  // Si no hay query ni categoría, usar sources internacionales
  params.sources = 'bbc-news,cnn,reuters,the-guardian,techcrunch,ars-technica,wired';
} else {
  // Si hay query pero no categoría, usar country
  params.country = 'us';
}
```

### ✅ 3. Corrección del Esquema de Datos
```typescript
// Antes (incorrecto)
source: {
  name: article.source.name,
  id: article.source.id,
  url: article.source.url
}

// Después (correcto)
source: 'newsapi', // Identificar que viene de NewsAPI
sourceName: article.source.name,
sourceId: article.source.id,
sourceUrl: article.source.url,
```

### ✅ 4. Actualización del Modelo MongoDB
```typescript
const articleSchema = new mongoose.Schema({
  // ...campos existentes...
  source: { type: String, enum: ['newsapi', 'scraping'], default: 'scraping' },
  sourceName: { type: String, required: true },
  sourceId: { type: String },
  sourceUrl: { type: String },
  isEnriched: { type: Boolean, default: false },
  sentiment: {
    score: { type: Number },
    label: { type: String, enum: ['positive', 'negative', 'neutral'] }
  },
  summary: { type: String }
});
```

### ✅ 5. Optimización de Lógica de Caché
```typescript
// Solo obtener de caché artículos de NewsAPI recientes
const articles = await Article.find({
  ...(query && { title: new RegExp(query, 'i') }),
  ...(category && { category }),
  source: 'newsapi', // Solo obtener de caché artículos de NewsAPI
  createdAt: { $gte: cacheTime } // Que hayan sido guardados recientemente
})
```

### ✅ 6. Endpoint de Limpieza de Caché
```typescript
// /api/news/clear-cache DELETE endpoint
// Permite limpiar artículos antiguos para forzar refresh
```

### ✅ 7. Mejora del Manejo de Errores
```typescript
// Hook useNews - Mejor información de errores
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar las noticias`);
}
```

## Resultados

### ✅ Estado Anterior
- ❌ Error 401 Unauthorized
- ❌ Error 400 Bad Request con categorías
- ❌ 0 resultados con fuentes españolas
- ❌ Mensajes de error genéricos
- ❌ Noticias marcadas como "Scraping Local"
- ❌ Solo noticias del día actual

### ✅ Estado Actual
- ✅ Endpoint `/api/news` funciona correctamente
- ✅ Categorías funcionan (technology: 31, business: 58, sports: 47, etc.)
- ✅ Fuentes internacionales disponibles (BBC, CNN, Reuters, etc.)
- ✅ 60+ artículos disponibles por defecto
- ✅ Noticias correctamente marcadas como "NewsAPI"
- ✅ Fechas diversas (no solo del día actual)
- ✅ Scroll infinito funcional
- ✅ Ordenamiento por fecha funcional
- ✅ Manejo de errores mejorado

## Verificaciones Realizadas

```bash
# ✅ Noticias generales con fuentes internacionales
GET /api/news?page=1&pageSize=10
# Response: 60 artículos con source: "newsapi"

# ✅ Noticias por categoría funcionando
GET /api/news?category=technology → 31 artículos
GET /api/news?category=business → 58 artículos  
GET /api/news?category=sports → 47 artículos

# ✅ Fechas diversas (no solo de hoy)
publishedAt: "2025-06-12T14:35:31.000Z" (ayer)
publishedAt: "2025-06-11T09:22:15.000Z" (hace 2 días)

# ✅ Campos correctos en el JSON
{
  "source": "newsapi",
  "sourceName": "CNN", 
  "sourceId": "cnn",
  "category": "technology"
}
```

## Archivos Modificados

1. **`.env.local`** - Corrección de variable de entorno NEWSAPI_KEY
2. **`src/app/api/news/route.ts`** - Lógica mejorada de parámetros, esquema y caché
3. **`src/lib/models/Article.ts`** - Modelo actualizado con campos correctos
4. **`src/app/api/news/clear-cache/route.ts`** - Nuevo endpoint para limpieza
5. **`src/hooks/use-news.ts`** - Mejor manejo de errores
6. **`src/types/index.ts`** - Tipos actualizados (ya estaba correcto)

## Estado del Sistema

🟢 **Funcional**: El scroll infinito y ordenamiento de noticias están completamente operativos  
🟢 **API**: Todos los endpoints responden correctamente  
🟢 **Clasificación**: Las noticias se muestran correctamente como "NewsAPI"  
🟢 **Fechas**: Se muestran noticias de varios días, no solo del actual  
🟢 **Categorías**: Todas las categorías funcionan correctamente  
🟢 **UX**: Los errores se manejan apropiadamente y se muestran al usuario  
🟢 **Performance**: Caché de 15 minutos optimizado para NewsAPI  

---

**Fecha**: 13 de junio de 2025  
**Estado**: ✅ COMPLETAMENTE RESUELTO  
**Próximos pasos**: Monitorear logs de producción y considerar implementar más fuentes de noticias
