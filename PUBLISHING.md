# Publicação da Extensão

Este documento contém instruções para empacotar e publicar a extensão PlayStation 1 Development.

## Pré-requisitos

- Node.js e npm instalados
- Conta no Visual Studio Code Marketplace

## Empacotamento para Teste

Para criar um pacote VSIX para teste local:

1. Instale a ferramenta vsce:
   ```
   npm install -g vsce
   ```

2. Execute o script de empacotamento:
   ```
   ./package-extension.sh
   ```
   
   Ou manualmente:
   ```
   vsce package
   ```

3. Isso criará um arquivo `ps1-dev-extension-0.1.0.vsix` na pasta raiz do projeto.

## Instalação Local

Para instalar a extensão localmente para teste:

1. Abra o VS Code
2. Vá para a aba de extensões (Ctrl+Shift+X)
3. Clique no menu "..." (Mais ações) no topo do painel de extensões
4. Selecione "Instalar a partir do VSIX..."
5. Navegue até o arquivo `.vsix` gerado e selecione-o

Ou use o comando:
```
code --install-extension ps1-dev-extension-0.1.0.vsix
```

## Publicação no Marketplace

Para publicar a extensão no VS Code Marketplace:

1. Crie uma conta no [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. Crie um Personal Access Token (PAT) no Azure DevOps:
   - Acesse [dev.azure.com](https://dev.azure.com/)
   - Clique no ícone do seu perfil no canto superior direito
   - Selecione "Personal access tokens"
   - Clique em "New Token"
   - Dê um nome ao token
   - Selecione "Full access" ou pelo menos "Marketplace (publish)"
   - Clique em "Create" e guarde o token gerado

3. Crie um publisher:
   ```
   vsce create-publisher YourPublisherName
   ```

4. Publique a extensão:
   ```
   vsce publish
   ```

## Atualização da Extensão

Para atualizar a extensão:

1. Atualize a versão no `package.json`
2. Execute `vsce publish` novamente

## Notas

- O tamanho máximo de uma extensão no VS Code Marketplace é de 100MB. Se sua extensão exceder esse limite, considere hospedar as ferramentas em um servidor externo e fazer download durante a instalação.
- Certifique-se de que tem permissão para distribuir todas as ferramentas incluídas na sua extensão.
