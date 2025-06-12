#!/bin/bash

# ===========================================
# Studio News App - Docker Management Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker no está ejecutándose. Por favor, inicia Docker Desktop."
        exit 1
    fi
}

# Check if .env.local exists
check_env() {
    if [ ! -f ".env.local" ]; then
        log_warning ".env.local no encontrado. Copiando desde .env.example..."
        cp .env.example .env.local
        log_warning "Por favor, edita .env.local con tu NewsAPI key antes de continuar."
        echo "NEXT_PUBLIC_NEWSAPI_KEY=tu_api_key_aqui"
        exit 1
    fi
}

# Start services
start() {
    log_info "Iniciando servicios Docker..."
    check_docker
    check_env
    
    docker-compose up -d --build
    
    log_success "Servicios iniciados. Esperando que estén listos..."
    
    # Wait for services to be ready
    log_info "Esperando MongoDB..."
    until docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        printf "."
        sleep 2
    done
    
    log_info "Esperando aplicación..."
    until curl -f http://localhost:3000/api/health > /dev/null 2>&1; do
        printf "."
        sleep 2
    done
    
    log_success "¡Aplicación lista!"
    log_info "URL: http://localhost:3000"
    log_info "Health Check: http://localhost:3000/api/health"
}

# Stop services
stop() {
    log_info "Deteniendo servicios..."
    docker-compose down
    log_success "Servicios detenidos."
}

# Show status
status() {
    log_info "Estado de los servicios:"
    docker-compose ps
    
    echo ""
    log_info "Health Checks:"
    
    # Check app health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Aplicación: OK (http://localhost:3000)"
    else
        log_error "Aplicación: No disponible"
    fi
    
    # Check MongoDB
    if docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        log_success "MongoDB: OK"
    else
        log_error "MongoDB: No disponible"
    fi
}

# Show logs
logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        log_info "Mostrando logs de $service..."
        docker-compose logs -f "$service"
    else
        log_info "Mostrando logs de todos los servicios..."
        docker-compose logs -f
    fi
}

# Restart services
restart() {
    log_info "Reiniciando servicios..."
    stop
    sleep 2
    start
}

# Clean up
clean() {
    log_warning "Esto eliminará todos los contenedores y volúmenes. ¿Continuar? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Limpiando..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        log_success "Limpieza completada."
    else
        log_info "Operación cancelada."
    fi
}

# Backup database
backup() {
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    log_info "Creando backup en $backup_dir..."
    docker-compose exec -T mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/newsapi?authSource=admin" --out=/tmp/backup
    docker-compose exec -T mongodb tar -czf /tmp/backup.tar.gz -C /tmp backup
    docker cp $(docker-compose ps -q mongodb):/tmp/backup.tar.gz "$backup_dir/mongodb_backup.tar.gz"
    
    log_success "Backup creado en $backup_dir/mongodb_backup.tar.gz"
}

# Show help
help() {
    echo "Studio News App - Docker Management"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start     - Iniciar todos los servicios"
    echo "  stop      - Detener todos los servicios"
    echo "  restart   - Reiniciar todos los servicios"
    echo "  status    - Mostrar estado de los servicios"
    echo "  logs      - Mostrar logs (opcional: especificar servicio)"
    echo "  clean     - Limpiar contenedores y volúmenes"
    echo "  backup    - Crear backup de la base de datos"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 start"
    echo "  $0 logs app"
    echo "  $0 status"
}

# Main script logic
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    clean)
        clean
        ;;
    backup)
        backup
        ;;
    help|--help|-h)
        help
        ;;
    *)
        log_error "Comando desconocido: $1"
        help
        exit 1
        ;;
esac
