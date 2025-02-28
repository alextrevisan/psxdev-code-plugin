# PlayStation 1 Development Extension for VSCode/Windsurf

Esta extensão fornece ferramentas para desenvolvimento de jogos e aplicativos para PlayStation 1, incluindo:

- GCC, SDK do PlayStation 1 e emulador incluídos
- Criação de projetos Hello World
- Compilação de projetos para PlayStation 1
- Geração de ISO para projetos
- Execução de projetos no emulador

## Instalação

Como esta é uma extensão local, você precisará:

1. Copiar esta pasta para o diretório de extensões do VSCode:
   - Windows: `%USERPROFILE%\.vscode\extensions`
   - macOS: `~/.vscode/extensions`
   - Linux: `~/.vscode/extensions`

2. Reiniciar o VSCode/Windsurf

## Ferramentas Incluídas

Esta extensão inclui as seguintes ferramentas para desenvolvimento PlayStation 1:

- **GCC para MIPS**: Compilador GCC configurado para o processador MIPS R3000A do PlayStation 1
- **PSN00B SDK**: SDK para desenvolvimento de jogos PlayStation 1
- **Emulador**: Um emulador de PlayStation 1 (opcional)

## Funcionalidades

- **Configuração Automática do Ambiente**: A extensão configura automaticamente o ambiente de desenvolvimento PlayStation 1 ao ser carregada.
- **Download Automático de Ferramentas**: Se as ferramentas não estiverem incluídas, a extensão oferecerá a opção de baixá-las automaticamente.
- **Criação de Projetos**: Crie facilmente projetos "Hello World" para PlayStation 1.
- **Compilação de Projetos**: Compile seus projetos PlayStation 1 com um único comando.
- **Geração de ISO**: Gere arquivos ISO para seus projetos, prontos para serem executados em emuladores ou hardware real.
- **Execução no Emulator**: Execute seus projetos compilados diretamente no emulador.

## Requisitos

- Visual Studio Code ou Windsurf
- Sistema operacional: Windows, macOS ou Linux

## Instalação

1. Instale a extensão através do Marketplace do VS Code ou Windsurf.
2. A extensão verificará automaticamente se as ferramentas necessárias estão incluídas.
3. Se alguma ferramenta estiver faltando, você será notificado para adicioná-la ao diretório `tools` da extensão.

## Uso

### Configuração do Ambiente

A extensão configura automaticamente o ambiente de desenvolvimento ao ser carregada. Se você precisar configurar manualmente, use o comando:

```
PlayStation 1: Setup Development Environment
```

### Criação de Projeto Hello World

Para criar um novo projeto "Hello World" para PlayStation 1:

1. Abra uma pasta no VS Code onde deseja criar o projeto.
2. Execute o comando `PS1: Create Hello World Project`.
3. Digite o nome do projeto quando solicitado.
4. O projeto será criado com um arquivo `main.c`, `Makefile`, `setup.mk` e outros arquivos necessários.

### Compilação de Projeto

Para compilar seu projeto PlayStation 1:

1. Abra um arquivo do projeto (por exemplo, `main.c`).
2. Execute o comando `PS1: Build Project`.
3. O projeto será compilado usando o Makefile, gerando arquivos binários na pasta `bin`.

### Geração de ISO

Para gerar um arquivo ISO do seu projeto:

1. Compile o projeto primeiro.
2. Execute o comando `PS1: Generate ISO`.
3. O arquivo ISO e CUE serão gerados na pasta `iso` do seu projeto.

### Execução no Emulador

Para executar seu projeto no emulador:

1. Compile o projeto e gere o ISO primeiro.
2. Execute o comando `PS1: Run in Emulator`.
3. O emulador configurado no Makefile será iniciado com o arquivo ISO gerado.

## Estrutura do Projeto

Os projetos criados com esta extensão têm a seguinte estrutura:

```
projeto/
├── main.c           - Código fonte principal
├── Makefile         - Makefile principal do projeto
├── setup.mk         - Configurações do ambiente de compilação
├── system.cnf       - Arquivo de configuração do PlayStation
├── cd.xml           - Configuração para geração de ISO
├── bin/             - Arquivos binários compilados
└── iso/             - Arquivos ISO gerados
```

## Personalização do Makefile

O Makefile gerado inclui várias configurações que você pode personalizar:

- **Emulador**: Você pode configurar diferentes emuladores no Makefile.
- **Organização de Código**: O Makefile suporta organização em diretórios como `engine/` e `ui/`.
- **Flags de Compilação**: Diversas flags de otimização e configuração já estão incluídas.

## Estrutura de Diretórios

```
ps1-dev-extension/
├── tools/
│   ├── gcc/          - Compilador GCC para MIPS
│   ├── psn00b_sdk/   - SDK PlayStation 1
│   └── emulator/     - Emulador PlayStation 1 (opcional)
└── templates/
    └── hello-world/  - Template de projeto Hello World
```

## Notas

- Se você encontrar problemas com a compilação, verifique se o compilador GCC e o SDK estão corretamente instalados no diretório `tools`.
- Para adicionar um emulador, coloque o executável do emulador no diretório `tools/emulator/`.

## Notas de Lançamento

### 0.2.0

- Adicionado suporte para download automático de ferramentas
- Novo formato de Makefile com suporte a geração de ISO e múltiplos emuladores
- Adicionado comando para gerar ISO
- Atualizado o comando de execução para usar o comando 'make run'

### 0.1.0

Lançamento inicial com funcionalidade básica.
