# 🚀 Guía de Deployment en Vercel

Esta guía te ayudará a desplegar tu aplicación News API Studio en Vercel de manera exitosa.

## ✅ Prerequisitos

- [ ] Cuenta en [Vercel](https://vercel.com)
- [ ] Repositorio en GitHub
- [ ] Base de datos MongoDB (preferiblemente MongoDB Atlas)
- [ ] API Key de NewsAPI

## 🔧 Configuración Previa

### 1. Verificar Compatibilidad Next.js 15

El proyecto ya está optimizado para Next.js 15 con:
- ✅ **Params async**: Todos los dynamic routes usan `await params`
- ✅ **Suspense boundaries**: `useSearchParams()` envuelto en Suspense
- ✅ **Build optimizado**: Sin errores de pre-renderizado

### 2. Variables de Entorno Requeridas

```env
# MongoDB (usar MongoDB Atlas para production)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/newsapi

# NextAuth (generar secret seguro)
NEXTAUTH_SECRET=tu_secret_super_seguro_minimo_32_caracteres
NEXTAUTH_URL=https://tu-app.vercel.app

# NewsAPI
NEWS_API_KEY=tu_api_key_de_newsapi_aqui
```

## 🚀 Proceso de Deployment

### Opción 1: GitHub Integration (Recomendado)

1. **Conectar repositorio a Vercel**:
   ```bash
   # Subir código a GitHub
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Crear proyecto en Vercel**:
   - Ir a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Seleccionar repositorio GitHub
   - Framework: Next.js (auto-detectado)

3. **Configurar variables de entorno**:
   - En "Environment Variables" añadir todas las variables requeridas
   - Asegurar que están disponibles para Preview, Development y Production

4. **Deploy**:
   - Click "Deploy"
   - Vercel automáticamente detectará Next.js y ejecutará el build

### Opción 2: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy (primera vez)
vercel

# Deploy a production
vercel --prod
```

## 🗄️ Configuración MongoDB Atlas

### 1. Crear Cluster

1. Ir a [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear nuevo cluster (M0 gratuito para testing)
3. Esperar a que se complete la configuración

### 2. Configurar Seguridad

```bash
# Crear usuario de base de datos
Usuario: newsapi-user
Password: [generar password seguro]
Roles: readWrite@newsapi
```

### 3. Network Access

```bash
# Permitir acceso desde Vercel
IP Address: 0.0.0.0/0 (permite todas las IPs)
Descripción: Vercel deployment access
```

### 4. Obtener Connection String

```env
# Formato del connection string
MONGODB_URI=mongodb+srv://newsapi-user:PASSWORD@cluster0.xxxxx.mongodb.net/newsapi?retryWrites=true&w=majority
```

## 🔍 Verificación Post-Deployment

### 1. Health Check

```bash
# Verificar que la API funciona
curl https://tu-app.vercel.app/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-06-12T...",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Funcionalidades Clave

- [ ] **Login/Register**: `/auth/login` y `/auth/register`
- [ ] **Dashboard**: `/dashboard` (requiere autenticación)
- [ ] **Data Sources**: `/datasources` 
- [ ] **News API**: `/api/news`
- [ ] **Scraped Data**: `/api/scraped-items`

### 3. Logs de Deployment

```bash
# Ver logs en tiempo real
vercel logs tu-app.vercel.app

# Ver logs de functions
vercel logs tu-app.vercel.app --since=1h
```

## 🐛 Troubleshooting

### Error: Build Failed

```bash
# Error común: Missing environment variables
Error: Environment variable MONGODB_URI is not defined
```

**Solución**: Verificar que todas las variables están configuradas en Vercel Dashboard.

### Error: Database Connection

```bash
# Error de conexión a MongoDB
MongoNetworkError: failed to connect to server
```

**Solución**: 
1. Verificar Network Access en MongoDB Atlas
2. Confirmar connection string correcto
3. Verificar credenciales de usuario

### Error: API Routes

```bash
# Error en dynamic routes
TypeError: Cannot read properties of undefined (reading 'id')
```

**Solución**: Ya corregido - todos los routes usan `await params`.

### Error: Suspense Boundary

```bash
# Error de useSearchParams
Error: useSearchParams() should be wrapped in a suspense boundary
```

**Solución**: Ya corregido - `/auth/login` envuelto en Suspense.

## 📋 Checklist Final

Antes de deployment:

- [ ] Variables de entorno configuradas en Vercel
- [ ] MongoDB Atlas configurado y accesible
- [ ] NewsAPI key válida
- [ ] Build local exitoso (`npm run build`)
- [ ] Tests básicos funcionando (`npm run dev`)

Post-deployment:

- [ ] Health check responde OK
- [ ] Login/register funcionan
- [ ] APIs responden correctamente
- [ ] Dashboard carga sin errores
- [ ] Scraping funciona (opcional)

## 🎉 ¡Deployment Exitoso!

Tu aplicación News API Studio está ahora disponible en:
```
https://tu-app.vercel.app
```

### Próximos Pasos

1. **Configurar dominio custom** (opcional)
2. **Añadir Analytics** de Vercel
3. **Configurar CI/CD** para auto-deployment
4. **Monitoreo** con Vercel Analytics

### URLs Importantes

- **Dashboard**: https://tu-app.vercel.app/dashboard
- **API Health**: https://tu-app.vercel.app/api/health
- **Login**: https://tu-app.vercel.app/auth/login
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 📞 Soporte

Si encuentras problemas durante el deployment:

1. **Revisar logs** en Vercel Dashboard
2. **Verificar variables** de entorno
3. **Comprobar MongoDB** Atlas connectivity
4. **Consultar documentación** de [Vercel Next.js](https://vercel.com/docs/frameworks/nextjs)
