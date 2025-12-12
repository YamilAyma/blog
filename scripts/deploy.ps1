# Script de despliegue del blog a GitHub Pages en repositorio separado

$ErrorActionPreference = "Stop"

# Rutas: Actualizar según la ubicación en la computadora.
$BlogDir = "C:\Users\yamilayma\Desktop\blog"
$DistDir = "$BlogDir\dist"
$DeployDir = "C:\Users\yamilayma\Desktop\blog_dist"

Write-Host "Construyendo el blog..." -ForegroundColor Cyan
Set-Location $BlogDir
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en el build" -ForegroundColor Red
    exit 1
}

Write-Host "Limpiando directorio de deploy..."
Set-Location $DeployDir

# Eliminar todo excepto .git
Get-ChildItem -Path $DeployDir -Exclude ".git" | Remove-Item -Recurse -Force

Write-Host "Copiando archivos de dist/..." -ForegroundColor Green
Copy-Item -Path "$DistDir\*" -Destination $DeployDir -Recurse -Force

Write-Host "Haciendo commit y push..." -ForegroundColor Magenta
git add .
$date = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Deploy: $date"
git push

Write-Host "¡Despliegue completado!" -ForegroundColor Green
Write-Host "Tu blog estará disponible en: https://yamilayma.github.io/" -ForegroundColor Cyan

Set-Location $BlogDir
