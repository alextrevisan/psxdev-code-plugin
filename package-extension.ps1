# Script para empacotar a extensão PS1 Development para VSCode/Windsurf

# Verificar tamanho dos diretórios
Write-Host "Verificando tamanho dos diretórios..."
$toolsSize = (Get-ChildItem -Path "tools" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Tamanho do diretório tools: $([math]::Round($toolsSize, 2)) MB"

# Verificar se vsce está instalado
$vsceExists = Get-Command vsce -ErrorAction SilentlyContinue
if (-not $vsceExists) {
    Write-Host "vsce não está instalado. Instalando..."
    npm install -g @vscode/vsce
}

# Empacotar a extensão
Write-Host "Empacotando a extensão..."
vsce package

Write-Host "Pacote criado com sucesso!"
Write-Host "Para instalar manualmente no VS Code, use o comando:"
Write-Host "code --install-extension ps1-dev-extension-0.1.0.vsix"
Write-Host ""
Write-Host "NOTA: Este pacote não inclui as ferramentas grandes (GCC, SDK, Emulator)."
Write-Host "Elas serão baixadas automaticamente quando a extensão for instalada."
