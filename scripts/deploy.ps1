# Script de despliegue del blog a GitHub Pages con Sincronización
$ErrorActionPreference = "Stop"

# Rutas
$BlogDir = "C:\Users\yamilayma\Desktop\blog"
$DistDir = "$BlogDir\dist"
$DeployDir = "C:\Users\yamilayma\Desktop\blog_dist"

Write-Host "--- Iniciando proceso de despliegue ---" -ForegroundColor Cyan

# Asegurarnos de tener lo último del repositorio remoto
Write-Host "Sincronizando con los cambios de GitHub Actions..." -ForegroundColor Yellow
Set-Location $DeployDir

# Traer cambios (debido a que el bot publica según tiempo).
git fetch origin
git reset --hard origin/main

# Construir el blog en la carpeta de origen
Write-Host "Construyendo el blog (Astro)..." -ForegroundColor Cyan
Set-Location $BlogDir
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en el build de Astro" -ForegroundColor Red
    exit 1
}

# Limpiar y preparar la carpeta de deploy
Write-Host "Limpiando directorio de deploy..." -ForegroundColor Gray
Set-Location $DeployDir
# Eliminar todo excepto la carpeta .git
Get-ChildItem -Path $DeployDir -Exclude ".git" | Remove-Item -Recurse -Force

# Copiar los nuevos archivos generados
Write-Host "Copiando nuevos archivos de dist/..." -ForegroundColor Green
Copy-Item -Path "$DistDir\*" -Destination $DeployDir -Recurse -Force

# Hacer commit y push
Write-Host "Subiendo cambios a GitHub..." -ForegroundColor Magenta
git add .
$date = Get-Date -Format "yyyy-MM-dd HH:mm"
# Si no hay cambios, el script no fallará gracias a "|| echo"
git commit -m "Deploy Manual: $date" || echo "No hay cambios que aplicar"

Write-Host "Enviando a GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "¡Despliegue completado con éxito!" -ForegroundColor Green
Write-Host "Tu blog se está actualizando en: https://yamilayma.github.io/" -ForegroundColor Cyan

Set-Location $BlogDir