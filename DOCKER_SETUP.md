# 🐳 Docker Setup - Studio News App

## 📋 Requisitos Previos

- Docker Desktop instalado
- Docker Compose disponible
- Al menos 2GB de RAM libre
- Puertos 3000 y 27017 disponibles

## 🚀 Inicio Rápido

### 1. Configuración de Variables de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con tu NewsAPI key
# NEXT_PUBLIC_NEWSAPI_KEY=tu_api_key_aqui
```

### 2. Construir y Ejecutar

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Solo logs de la aplicación
docker-compose logs -f app
```

### 3. Verificar el Estado

```bash
# Verificar que los servicios estén ejecutándose
docker-compose ps

# Health check de la aplicación
curl http://localhost:3000/api/health

# Health check de MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## 🔧 Servicios Incluidos

### 📱 Aplicación Next.js (`app`)
- **Puerto**: 3000
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Funcionalidades**:
  - Interfaz web completa
  - API REST para CRUD
  - Sistema de scraping
  - Integración con NewsAPI

### 🗄️ MongoDB (`mongodb`)
- **Puerto**: 27017
- **Usuario**: admin
- **Contraseña**: password123
- **Base de Datos**: newsapi
- **Volumen Persistente**: `mongodb_data`

## 📂 Estructura de Volúmenes

```
mongodb_data/          # Datos persistentes de MongoDB
├── db/               # Archivos de base de datos
└── configdb/         # Configuración de MongoDB
```

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Parar servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart app

# Ver estado de los servicios
docker-compose ps

# Ver logs
docker-compose logs -f [service-name]
```

### Base de Datos

```bash
# Acceder a MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# Backup de la base de datos
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/newsapi?authSource=admin" --out=/tmp/backup

# Restore de la base de datos
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/newsapi?authSource=admin" /tmp/backup/newsapi
```

### Mantenimiento

```bash
# Limpiar contenedores parados
docker-compose down --remove-orphans

# Limpiar volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ver uso de recursos
docker-compose top
```

## 🔍 Monitoreo y Debugging

### Health Checks

Los servicios incluyen health checks automáticos:

- **App**: Verifica conectividad HTTP y base de datos
- **MongoDB**: Verifica disponibilidad del servicio

### Logs Detallados

```bash
# Logs con timestamps
docker-compose logs -f -t

# Últimas 100 líneas
docker-compose logs --tail=100

# Logs de un período específico
docker-compose logs --since="2024-01-01T00:00:00"
```

### Debugging de la Aplicación

```bash
# Ejecutar comando dentro del contenedor de la app
docker-compose exec app sh

# Ver variables de entorno
docker-compose exec app env

# Verificar conectividad a MongoDB
docker-compose exec app nc -zv mongodb 27017
```

## 🌐 Desarrollo vs Producción

### Modo Desarrollo

Para desarrollo con hot-reload, modifica el docker-compose.yml:

```yaml
services:
  app:
    build:
      target: development  # Cambia el target de build
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

### Modo Producción

El docker-compose.yml actual está optimizado para producción:
- Build multi-stage optimizado
- Standalone output de Next.js
- Health checks habilitados
- Restart automático

## 🚨 Troubleshooting

### Problemas Comunes

1. **Puerto en uso**:
   ```bash
   # Cambiar puertos en docker-compose.yml
   ports:
     - "3001:3000"  # Cambiar puerto local
   ```

2. **Memoria insuficiente**:
   ```bash
   # Aumentar memoria de Docker Desktop
   # Settings > Resources > Memory > 4GB+
   ```

3. **Problemas de conectividad**:
   ```bash
   # Verificar red de Docker
   docker network ls
   docker network inspect studio_studio-network
   ```

4. **Base de datos no conecta**:
   ```bash
   # Verificar logs de MongoDB
   docker-compose logs mongodb
   
   # Recrear volumen de DB (⚠️ BORRA DATOS)
   docker-compose down -v
   docker-compose up -d
   ```

## 📊 Métricas y Monitoreo

### Uso de Recursos

```bash
# Ver estadísticas de recursos
docker stats

# Solo para los servicios de la app
docker stats studio-app studio-mongodb
```

### Información del Sistema

```bash
# Información de Docker
docker system info

# Uso de espacio
docker system df

# Limpiar sistema (caché, contenedores parados, etc.)
docker system prune -a
```

## 🔐 Seguridad

### Variables Sensibles

- Nunca commiteear archivos `.env.local`
- Cambiar contraseñas por defecto en producción
- Usar secrets de Docker en producción real

### Red Aislada

Los servicios se ejecutan en una red aislada (`studio-network`) para mayor seguridad.

## 📈 Escalabilidad

Para escalar la aplicación:

```bash
# Escalar múltiples instancias de la app
docker-compose up -d --scale app=3

# Usar nginx como load balancer (requiere configuración adicional)
```

---

## ✅ Verificación Final

Después de ejecutar `docker-compose up -d`, verifica:

1. ✅ **Servicios ejecutándose**: `docker-compose ps`
2. ✅ **App disponible**: http://localhost:3000
3. ✅ **Health check**: http://localhost:3000/api/health
4. ✅ **MongoDB conectado**: Logs sin errores de conexión
5. ✅ **Scraping funcional**: Crear una fuente de datos y probar scraping
6. ✅ **NewsAPI funcional**: Buscar noticias en la interfaz

🎉 **¡Tu aplicación Docker está lista para producción!**
