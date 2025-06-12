# ===========================================
# Studio News App - Docker Management Script (PowerShell)
# ===========================================

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'clean', 'backup', 'help')]
    [string]$Command = 'help',
    
    [Parameter(Position=1)]
    [string]$Service = ''
)

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-Error "Docker no está ejecutándose. Por favor, inicia Docker Desktop."
        exit 1
    }
}

# Check if .env.local exists
function Test-EnvFile {
    if (-not (Test-Path ".env.local")) {
        Write-Warning ".env.local no encontrado. Copiando desde .env.example..."
        Copy-Item ".env.example" ".env.local"
        Write-Warning "Por favor, edita .env.local con tu NewsAPI key antes de continuar."
        Write-Host "NEXT_PUBLIC_NEWSAPI_KEY=tu_api_key_aqui" -ForegroundColor Yellow
        exit 1
    }
}

# Start services
function Start-Services {
    Write-Info "Iniciando servicios Docker..."
    Test-Docker
    Test-EnvFile
    
    docker-compose up -d --build
    
    Write-Success "Servicios iniciados. Esperando que estén listos..."
    
    # Wait for MongoDB
    Write-Info "Esperando MongoDB..."
    do {
        Write-Host "." -NoNewline
        Start-Sleep 2
    } while (-not (docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping')" 2>$null))
    
    Write-Host ""
    
    # Wait for application
    Write-Info "Esperando aplicación..."
    do {
        Write-Host "." -NoNewline
        Start-Sleep 2
    } while (-not (Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet))
    
    Write-Host ""
    Write-Success "¡Aplicación lista!"
    Write-Info "URL: http://localhost:3000"
    Write-Info "Health Check: http://localhost:3000/api/health"
}

# Stop services
function Stop-Services {
    Write-Info "Deteniendo servicios..."
    docker-compose down
    Write-Success "Servicios detenidos."
}

# Show status
function Show-Status {
    Write-Info "Estado de los servicios:"
    docker-compose ps
    
    Write-Host ""
    Write-Info "Health Checks:"
    
    # Check app health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Aplicación: OK (http://localhost:3000)"
        } else {
            Write-Error "Aplicación: Error HTTP $($response.StatusCode)"
        }
    } catch {
        Write-Error "Aplicación: No disponible"
    }
    
    # Check MongoDB
    try {
        $null = docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping')" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "MongoDB: OK"
        } else {
            Write-Error "MongoDB: No disponible"
        }
    } catch {
        Write-Error "MongoDB: No disponible"
    }
}

# Show logs
function Show-Logs {
    param([string]$ServiceName)
    
    if ($ServiceName) {
        Write-Info "Mostrando logs de $ServiceName..."
        docker-compose logs -f $ServiceName
    } else {
        Write-Info "Mostrando logs de todos los servicios..."
        docker-compose logs -f
    }
}

# Restart services
function Restart-Services {
    Write-Info "Reiniciando servicios..."
    Stop-Services
    Start-Sleep 2
    Start-Services
}

# Clean up
function Clean-Docker {
    Write-Warning "Esto eliminará todos los contenedores y volúmenes. ¿Continuar? (y/N)"
    $response = Read-Host
    if ($response -match '^[yY]([eE][sS])?$') {
        Write-Info "Limpiando..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Success "Limpieza completada."
    } else {
        Write-Info "Operación cancelada."
    }
}

# Backup database
function Backup-Database {
    $backupDir = "./backups/$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    Write-Info "Creando backup en $backupDir..."
    
    docker-compose exec -T mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/newsapi?authSource=admin" --out=/tmp/backup
    docker-compose exec -T mongodb tar -czf /tmp/backup.tar.gz -C /tmp backup
    
    $containerId = docker-compose ps -q mongodb
    docker cp "${containerId}:/tmp/backup.tar.gz" "$backupDir/mongodb_backup.tar.gz"
    
    Write-Success "Backup creado en $backupDir/mongodb_backup.tar.gz"
}

# Show help
function Show-Help {
    Write-Host "Studio News App - Docker Management (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\docker-manager.ps1 [comando] [servicio]" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor White
    Write-Host "  start     - Iniciar todos los servicios" -ForegroundColor Gray
    Write-Host "  stop      - Detener todos los servicios" -ForegroundColor Gray
    Write-Host "  restart   - Reiniciar todos los servicios" -ForegroundColor Gray
    Write-Host "  status    - Mostrar estado de los servicios" -ForegroundColor Gray
    Write-Host "  logs      - Mostrar logs (opcional: especificar servicio)" -ForegroundColor Gray
    Write-Host "  clean     - Limpiar contenedores y volúmenes" -ForegroundColor Gray
    Write-Host "  backup    - Crear backup de la base de datos" -ForegroundColor Gray
    Write-Host "  help      - Mostrar esta ayuda" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor White
    Write-Host "  .\docker-manager.ps1 start" -ForegroundColor Gray
    Write-Host "  .\docker-manager.ps1 logs app" -ForegroundColor Gray
    Write-Host "  .\docker-manager.ps1 status" -ForegroundColor Gray
}

# Main script logic
switch ($Command) {
    'start' { Start-Services }
    'stop' { Stop-Services }
    'restart' { Restart-Services }
    'status' { Show-Status }
    'logs' { Show-Logs -ServiceName $Service }
    'clean' { Clean-Docker }
    'backup' { Backup-Database }
    'help' { Show-Help }
    default {
        Write-Error "Comando desconocido: $Command"
        Show-Help
        exit 1
    }
}
