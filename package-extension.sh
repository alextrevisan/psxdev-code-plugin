#!/bin/bash

# Verificar tamanho dos diretórios
echo "Verificando tamanho dos diretórios..."
TOOLS_SIZE=$(du -sh tools | cut -f1)
echo "Tamanho do diretório tools: $TOOLS_SIZE"

# Verificar se vsce está instalado
if ! command -v vsce &> /dev/null; then
    echo "vsce não está instalado. Instalando..."
    npm install -g vsce
fi

# Empacotar a extensão
echo "Empacotando a extensão..."
vsce package

echo "Pacote criado com sucesso!"
echo "Para instalar manualmente no VS Code, use o comando:"
echo "code --install-extension ps1-dev-extension-0.1.0.vsix"
echo ""
echo "NOTA: Este pacote não inclui as ferramentas grandes (GCC, SDK, Emulator)."
echo "Elas serão baixadas automaticamente quando a extensão for instalada."
