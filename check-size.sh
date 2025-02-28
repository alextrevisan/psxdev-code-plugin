#!/bin/bash

echo "Verificando tamanho dos diretórios..."

# Verificar tamanho do diretório tools
TOOLS_SIZE=$(du -sh tools | cut -f1)
echo "Tamanho do diretório tools: $TOOLS_SIZE"

# Verificar tamanho de cada subdiretório em tools
echo "Detalhamento do diretório tools:"
du -sh tools/* | sort -hr

# Verificar tamanho total do projeto
TOTAL_SIZE=$(du -sh . | cut -f1)
echo "Tamanho total do projeto: $TOTAL_SIZE"

# Aviso sobre o limite do marketplace
echo ""
echo "NOTA: O VS Code Marketplace tem um limite de 100MB para extensões."
echo "Se o tamanho total estiver próximo ou acima desse limite, considere:"
echo "1. Remover arquivos desnecessários"
echo "2. Comprimir as ferramentas"
echo "3. Hospedar as ferramentas em um servidor externo"
