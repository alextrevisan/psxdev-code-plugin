const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const axios = require('axios');
const extract = require('extract-zip');
const fse = require('fs-extra');
const AdmZip = require('adm-zip');
const os = require('os');

// Extension paths
const extensionPath = __dirname;
const toolsPath = path.join(extensionPath, 'tools');
const gccPath = path.join(toolsPath, 'gcc');
const ps1SdkPath = path.join(toolsPath, 'psn00b_sdk');
const emulatorPath = path.join(toolsPath, 'emulator');
const templatesPath = path.join(extensionPath, 'templates');
const configPath = path.join(extensionPath, 'config.json');
const toolsUrlsPath = path.join(extensionPath, 'tools-urls.json');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('PlayStation 1 Development Extension is now active');

    // Verificar se o ambiente já está configurado e configurar automaticamente se necessário
    checkAndSetupEnvironment();

    // Register the setup environment command
    let setupDisposable = vscode.commands.registerCommand('ps1-dev-extension.setupEnvironment', async function () {
        try {
            await setupEnvironment(true); // true indica que é uma configuração manual
            vscode.window.showInformationMessage('PlayStation 1 development environment setup complete!');
        } catch (error) {
            vscode.window.showErrorMessage(`Setup failed: ${error.message}`);
        }
    });

    // Register the create Hello World command
    let createHelloWorldDisposable = vscode.commands.registerCommand('ps1-dev-extension.createHelloWorld', async function () {
        try {
            await createHelloWorld();
            vscode.window.showInformationMessage('Hello World project created successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create Hello World project: ${error.message}`);
        }
    });

    // Register the build project command
    let buildProjectDisposable = vscode.commands.registerCommand('ps1-dev-extension.buildProject', async function () {
        try {
            await buildProject();
            vscode.window.showInformationMessage('Project built successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Build failed: ${error.message}`);
        }
    });

    // Register the run emulator command
    let runEmulatorDisposable = vscode.commands.registerCommand('ps1-dev-extension.runEmulator', async function () {
        try {
            await runEmulator();
            vscode.window.showInformationMessage('Emulator launched successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to run emulator: ${error.message}`);
        }
    });

    // Register the generate ISO command
    let generateISODisposable = vscode.commands.registerCommand('ps1-dev-extension.generateISO', async function () {
        try {
            await generateISO();
            vscode.window.showInformationMessage('ISO generated successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate ISO: ${error.message}`);
        }
    });

    // Corrigir permissões
    const fixPermissionsDisposable = vscode.commands.registerCommand('ps1-dev-extension.fixPermissions', async () => {
        await fixToolPermissions();
    });

    context.subscriptions.push(setupDisposable);
    context.subscriptions.push(createHelloWorldDisposable);
    context.subscriptions.push(buildProjectDisposable);
    context.subscriptions.push(runEmulatorDisposable);
    context.subscriptions.push(generateISODisposable);
    context.subscriptions.push(fixPermissionsDisposable);
}

// Função para verificar e configurar o ambiente automaticamente
async function checkAndSetupEnvironment() {
    try {
        const config = loadConfig();
        
        // Verificar se as ferramentas já estão incluídas no plugin
        const gccIncludedPath = path.join(extensionPath, 'tools', 'gcc');
        const ps1SdkIncludedPath = path.join(extensionPath, 'tools', 'psn00b_sdk');
        const emulatorIncludedPath = path.join(extensionPath, 'tools', 'emulator');
        
        // Verificar se as ferramentas incluídas existem
        const gccExists = fs.existsSync(gccIncludedPath) && fs.readdirSync(gccIncludedPath).length > 0;
        const ps1SdkExists = fs.existsSync(ps1SdkIncludedPath) && fs.readdirSync(ps1SdkIncludedPath).length > 0;
        const emulatorExists = fs.existsSync(emulatorIncludedPath) && fs.readdirSync(emulatorIncludedPath).length > 0;
        
        // Se todas as ferramentas estiverem incluídas, marcar como instaladas
        if (gccExists && ps1SdkExists) {
            config.tools.gcc.installed = true;
            config.tools.ps1sdk.installed = true;
            config.tools.emulator.installed = emulatorExists;
            saveConfig(config);
            console.log('PlayStation 1 development environment already set up with included tools');
            
            // Garantir que o template Hello World esteja criado
            await createHelloWorldTemplate();
            return;
        }
        
        // Se as ferramentas não estiverem incluídas, perguntar ao usuário se deseja baixá-las
        if (!gccExists || !ps1SdkExists) {
            const downloadChoice = await vscode.window.showInformationMessage(
                'Ferramentas necessárias para desenvolvimento PlayStation 1 não encontradas. Deseja baixá-las automaticamente?',
                'Sim', 'Não'
            );
            
            if (downloadChoice === 'Sim') {
                await setupEnvironment(true);
            } else {
                vscode.window.showWarningMessage(
                    'O ambiente de desenvolvimento PlayStation 1 não está completamente configurado. ' +
                    'Use o comando "PlayStation 1: Setup Development Environment" quando estiver pronto.'
                );
            }
        }
    } catch (error) {
        console.error('Failed to check and setup environment:', error);
    }
}

// Function to load the configuration
function loadConfig() {
    if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configContent);
    }
    return {
        tools: {
            gcc: { url: '', installed: false },
            ps1sdk: { url: '', installed: false },
            emulator: { url: '', installed: false }
        }
    };
}

// Function to save the configuration
function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Function to set up the development environment
async function setupEnvironment(isManualSetup = false) {
    // Create necessary directories
    ensureDirectoryExists(toolsPath);
    ensureDirectoryExists(gccPath);
    ensureDirectoryExists(ps1SdkPath);
    ensureDirectoryExists(emulatorPath);
    ensureDirectoryExists(templatesPath);

    // Load current configuration
    const config = loadConfig();
    
    // Verificar se as ferramentas já estão incluídas no plugin
    const gccExists = fs.existsSync(gccPath) && fs.readdirSync(gccPath).length > 0;
    const ps1SdkExists = fs.existsSync(ps1SdkPath) && fs.readdirSync(ps1SdkPath).length > 0;
    const emulatorExists = fs.existsSync(emulatorPath) && fs.readdirSync(emulatorPath).length > 0;
    
    // Se todas as ferramentas estiverem incluídas, marcar como instaladas
    if (gccExists && ps1SdkExists && emulatorExists) {
        config.tools.gcc.installed = true;
        config.tools.ps1sdk.installed = true;
        config.tools.emulator.installed = true;
        saveConfig(config);
        
        // Garantir que o template Hello World esteja criado
        await createHelloWorldTemplate();
        
        vscode.window.showInformationMessage('Ferramentas já incluídas no plugin. Ambiente configurado com sucesso!');
        return;
    }
    
    // Baixar ferramentas que estão faltando
    let downloadSuccess = true;
    
    if (!gccExists) {
        vscode.window.showInformationMessage('Baixando GCC para PlayStation 1...');
        const success = await downloadAndExtractTool('gcc');
        if (success) {
            config.tools.gcc.installed = true;
            vscode.window.showInformationMessage('GCC para PlayStation 1 baixado com sucesso!');
        } else {
            downloadSuccess = false;
        }
    }
    
    if (!ps1SdkExists) {
        vscode.window.showInformationMessage('Baixando SDK do PlayStation 1...');
        const success = await downloadAndExtractTool('psn00b_sdk');
        if (success) {
            config.tools.ps1sdk.installed = true;
            vscode.window.showInformationMessage('SDK do PlayStation 1 baixado com sucesso!');
        } else {
            downloadSuccess = false;
        }
    }
    
    if (!emulatorExists) {
        vscode.window.showInformationMessage('Baixando Emulador do PlayStation 1...');
        const success = await downloadAndExtractTool('emulator');
        if (success) {
            config.tools.emulator.installed = true;
            vscode.window.showInformationMessage('Emulador do PlayStation 1 baixado com sucesso!');
        } else {
            // Emulador é opcional, então não afeta o downloadSuccess
            vscode.window.showWarningMessage('Não foi possível baixar o emulador, mas ele é opcional.');
        }
    }
    
    saveConfig(config);
    
    if (downloadSuccess) {
        // Garantir que o template Hello World esteja criado
        await createHelloWorldTemplate();
        vscode.window.showInformationMessage('Ambiente de desenvolvimento PlayStation 1 configurado com sucesso!');
    } else {
        vscode.window.showWarningMessage(
            'Algumas ferramentas não puderam ser baixadas automaticamente. ' +
            'Por favor, adicione-as manualmente ao diretório "tools" do plugin.'
        );
    }
}

// Function to create a Hello World template
async function createHelloWorldTemplate() {
    const helloWorldPath = path.join(templatesPath, 'hello-world');
    await ensureDirectoryExists(helloWorldPath);

    // Verificar se os arquivos do template já existem
    const mainCPath = path.join(helloWorldPath, 'main.c');
    const makefilePath = path.join(helloWorldPath, 'Makefile');
    const setupMkPath = path.join(helloWorldPath, 'setup.mk');
    
    if (fs.existsSync(mainCPath) && fs.existsSync(makefilePath) && fs.existsSync(setupMkPath)) {
        console.log('Hello World template already exists');
        return;
    }

    // Create main.c
    const mainCContent = `
#include <stdio.h>
#include <stdlib.h>
#include <psx.h>
#include <sys/types.h>
#include <psxgpu.h>
#include <psxgte.h>
#include <psxpad.h>

// Define display/drawing environments
DISPENV disp;
DRAWENV draw;

int main() {
    // Initialize the PlayStation
    PSX_Init();
    
    // Set up the display and drawing environments for NTSC mode
    SetDefDispEnv(&disp, 0, 0, 320, 240);
    SetDefDrawEnv(&draw, 0, 0, 320, 240);
    
    // Set the background color to black
    setRGB0(&draw, 0, 0, 0);
    draw.isbg = 1;
    
    // Apply the environments
    PutDispEnv(&disp);
    PutDrawEnv(&draw);
    
    // Set the text color to white
    FntLoad(960, 0);
    SetDumpFnt(FntOpen(16, 16, 320, 240, 0, 512));
    
    // Main loop
    while(1) {
        // Clear the display
        ClearImage(&draw.clip, 0, 0, 0);
        
        // Print the Hello World message
        FntPrint("Hello, PlayStation World!\\n");
        FntFlush(-1);
        
        // Swap buffers
        DrawSync(0);
        VSync(0);
        PutDispEnv(&disp);
        PutDrawEnv(&draw);
    }
    
    return 0;
}
`;
    fs.writeFileSync(mainCPath, mainCContent);

    // Create Makefile
    const makefileContent = `
# PlayStation 1 Hello World Makefile

# Include setup.mk for paths and compiler settings
include setup.mk

TARGET = hello_world

OBJS = main.o

all: $(TARGET).ps-exe

$(TARGET).ps-exe: $(OBJS)
	$(CC) $(LIBDIRS) -o $@ $^ -lpsxgpu -lpsxgte -lpsxpad

%.o: %.c
	$(CC) $(INCLUDE) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET).ps-exe
`;
    fs.writeFileSync(makefilePath, makefileContent);
    
    // Create setup.mk
    const setupMkContent = `
# PSn00bSDK setup file
# Este arquivo será automaticamente atualizado pela extensão com os caminhos corretos
# Não modifique as variáveis $(GCC_PATH), $(PLUGIN_SDK_PATH) e $(EMULATOR_PATH)

# Paths - A extensão substituirá estas variáveis pelos caminhos corretos
PREFIX = mipsel-none-elf-
PSN00B_BASE = $(PLUGIN_SDK_PATH)

PSN00B_LIB = $(PSN00B_BASE)/lib
PSN00B_INCLUDE = $(PSN00B_BASE)/include
GCC_BASE = $(GCC_PATH)

LIBDIRS = -L$(PSN00B_LIB)
INCLUDE = -I$(PSN00B_INCLUDE)

ELF2X = $(PSN00B_BASE)/bin/elf2x
MKPSXISO = $(PSN00B_BASE)/bin/mkpsxiso
EMULATOR_DIR = $(EMULATOR_PATH)

GCC_BIN = $(GCC_BASE)/bin/

CC = $(GCC_BIN)$(PREFIX)gcc
CXX = $(GCC_BIN)$(PREFIX)g++
AS = $(GCC_BIN)$(PREFIX)as
AR = $(GCC_BIN)$(PREFIX)ar
RANLIB = $(GCC_BIN)$(PREFIX)ranlib
LD = $(GCC_BIN)$(PREFIX)ld

# Folders - Diretórios para arquivos de saída
MKPSXISO_XML = cd.xml
BIN_FOLDER = bin
ISO_FOLDER = iso
`;
    fs.writeFileSync(setupMkPath, setupMkContent);
    
    console.log('Hello World template created successfully');
}

// Function to create a Hello World project
async function createHelloWorld() {
    // Get the workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder is open');
    }
    
    const workspaceFolder = workspaceFolders[0].uri.fsPath;
    
    // Confirm with user before overwriting files in the workspace folder
    const confirmOverwrite = await vscode.window.showWarningMessage(
        'This will create Hello World project files in the current workspace folder. Existing files may be overwritten.',
        'Continue', 'Cancel'
    );
    
    if (confirmOverwrite !== 'Continue') {
        return;
    }
    
    // Use the current workspace folder as the project path
    const projectPath = workspaceFolder;
    
    // Copy template files
    const templatePath = path.join(templatesPath, 'hello-world');
    await fse.copy(templatePath, projectPath);
    
    // Update setup.mk with correct paths
    const setupMkPath = path.join(projectPath, 'setup.mk');
    if (fs.existsSync(setupMkPath)) {
        // Read the setup.mk file
        let setupMkContent = fs.readFileSync(setupMkPath, 'utf8');
        
        // Replace placeholders in setup.mk with actual paths
        setupMkContent = setupMkContent
            .replace(/\$\(GCC_PATH\)/g, gccPath.replace(/\\/g, '/'))
            .replace(/\$\(PS1SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
            .replace(/\$\(PLUGIN_SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
            .replace(/\$\(EMULATOR_PATH\)/g, emulatorPath.replace(/\\/g, '/'));
        
        // Write the updated setup.mk
        fs.writeFileSync(setupMkPath, setupMkContent);
        
        vscode.window.showInformationMessage('Hello World project created and configured with correct SDK paths.');
    } else {
        vscode.window.showWarningMessage('Hello World project created but setup.mk file not found. Build may fail.');
    }
    
    // Open the main.c file
    const mainCPath = path.join(projectPath, 'main.c');
    const document = await vscode.workspace.openTextDocument(mainCPath);
    await vscode.window.showTextDocument(document);
}

// Function to build the project
async function buildProject() {
    try {
        // Get the current workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        const projectPath = workspaceFolder.uri.fsPath;

        // Check if Makefile exists
        const makefilePath = path.join(projectPath, 'Makefile');
        if (!fs.existsSync(makefilePath)) {
            throw new Error('Makefile not found in the project directory');
        }

        // Get the paths to the tools
        const gccBinPath = path.join(gccPath, 'bin');
        const sdkBinPath = path.join(ps1SdkPath, 'bin');

        // Check if setup.mk exists and update it
        const setupMkPath = path.join(projectPath, 'setup.mk');
        if (fs.existsSync(setupMkPath)) {
            // Read the setup.mk file
            let setupMkContent = fs.readFileSync(setupMkPath, 'utf8');

            // Replace placeholders in setup.mk
            setupMkContent = setupMkContent
                .replace(/\$\(GCC_PATH\)/g, gccPath.replace(/\\/g, '/'))
                .replace(/\$\(PS1SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
                .replace(/\$\(PLUGIN_SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
                .replace(/\$\(EMULATOR_PATH\)/g, emulatorPath.replace(/\\/g, '/'));

            // Write the updated setup.mk
            fs.writeFileSync(setupMkPath, setupMkContent);
        } else {
            // If setup.mk doesn't exist, update the Makefile directly
            // Read the Makefile
            let makefileContent = fs.readFileSync(makefilePath, 'utf8');

            // Replace placeholders in the Makefile
            makefileContent = makefileContent
                .replace(/\$\(GCC_PATH\)/g, gccPath.replace(/\\/g, '/'))
                .replace(/\$\(PS1SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
                .replace(/\$\(PLUGIN_SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
                .replace(/\$\(EMULATOR_PATH\)/g, emulatorPath.replace(/\\/g, '/'));

            // Write the updated Makefile
            fs.writeFileSync(makefilePath, makefileContent);
        }

        // Create a terminal and run make
        const terminal = vscode.window.createTerminal('PS1 Build');
        terminal.show();

        // Construct the PATH environment variable based on the platform
        let pathEnv;
        if (process.platform === 'win32') {
            // Windows - PowerShell compatible command
            pathEnv = `$env:PATH = "${gccBinPath.replace(/\\/g, '\\')};${sdkBinPath.replace(/\\/g, '\\')};$env:PATH";`;
            terminal.sendText(`cd "${projectPath.replace(/\\/g, '\\')}"; ${pathEnv} make`);
        } else {
            // Unix-like systems (Linux, macOS)
            pathEnv = `PATH="${gccBinPath}:${sdkBinPath}:$PATH"`;
            terminal.sendText(`cd "${projectPath}" && ${pathEnv} make`);
        }
    } catch (error) {
        throw error;
    }
}

// Function to run the emulator
async function runEmulator() {
    try {
        // Get the current workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        const projectPath = workspaceFolder.uri.fsPath;

        // Check if Makefile exists
        const makefilePath = path.join(projectPath, 'Makefile');
        if (!fs.existsSync(makefilePath)) {
            throw new Error('Makefile not found in the project directory');
        }

        // Get the paths to the tools
        const gccBinPath = path.join(gccPath, 'bin');
        const sdkBinPath = path.join(ps1SdkPath, 'bin');

        // Check if setup.mk exists and update it
        const setupMkPath = path.join(projectPath, 'setup.mk');
        if (fs.existsSync(setupMkPath)) {
            // Read the setup.mk file
            let setupMkContent = fs.readFileSync(setupMkPath, 'utf8');

            // Replace placeholders in setup.mk
            setupMkContent = setupMkContent
                .replace(/\$\(GCC_PATH\)/g, gccPath.replace(/\\/g, '/'))
                .replace(/\$\(PS1SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
                .replace(/\$\(PLUGIN_SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
                .replace(/\$\(EMULATOR_PATH\)/g, emulatorPath.replace(/\\/g, '/'));

            // Write the updated setup.mk
            fs.writeFileSync(setupMkPath, setupMkContent);
        }

        // Create a terminal and run make
        const terminal = vscode.window.createTerminal('PS1 Emulator');
        terminal.show();

        // Construct the PATH environment variable based on the platform
        let pathEnv;
        if (process.platform === 'win32') {
            // Windows - PowerShell compatible command
            pathEnv = `$env:PATH = "${gccBinPath.replace(/\\/g, '\\')};${sdkBinPath.replace(/\\/g, '\\')};$env:PATH";`;
            terminal.sendText(`cd "${projectPath.replace(/\\/g, '\\')}"; ${pathEnv} make run`);
        } else {
            // Unix-like systems (Linux, macOS)
            pathEnv = `PATH="${gccBinPath}:${sdkBinPath}:$PATH"`;
            terminal.sendText(`cd "${projectPath}" && ${pathEnv} make run`);
        }
    } catch (error) {
        throw error;
    }
}

// Function to generate ISO
async function generateISO() {
    try {
        // Get the current workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        const projectPath = workspaceFolder.uri.fsPath;

        // Check if Makefile exists
        const makefilePath = path.join(projectPath, 'Makefile');
        if (!fs.existsSync(makefilePath)) {
            throw new Error('Makefile not found in the project directory');
        }

        // Get the paths to the tools
        const gccBinPath = path.join(gccPath, 'bin');
        const sdkBinPath = path.join(ps1SdkPath, 'bin');

        // Check if setup.mk exists and update it
        const setupMkPath = path.join(projectPath, 'setup.mk');
        if (fs.existsSync(setupMkPath)) {
            // Read the setup.mk file
            let setupMkContent = fs.readFileSync(setupMkPath, 'utf8');

            // Replace placeholders in setup.mk
            setupMkContent = setupMkContent
                .replace(/\$\(GCC_PATH\)/g, gccPath.replace(/\\/g, '/'))
                .replace(/\$\(PS1SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
                .replace(/\$\(PLUGIN_SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
                .replace(/\$\(EMULATOR_PATH\)/g, emulatorPath.replace(/\\/g, '/'));

            // Write the updated setup.mk
            fs.writeFileSync(setupMkPath, setupMkContent);
        }

        // Create a terminal and run make
        const terminal = vscode.window.createTerminal('PS1 ISO Generation');
        terminal.show();

        // Construct the PATH environment variable based on the platform
        let pathEnv;
        if (process.platform === 'win32') {
            // Windows - PowerShell compatible command
            pathEnv = `$env:PATH = "${gccBinPath.replace(/\\/g, '\\')};${sdkBinPath.replace(/\\/g, '\\')};$env:PATH";`;
            terminal.sendText(`cd "${projectPath.replace(/\\/g, '\\')}"; ${pathEnv} make iso`);
        } else {
            // Unix-like systems (Linux, macOS)
            pathEnv = `PATH="${gccBinPath}:${sdkBinPath}:$PATH"`;
            terminal.sendText(`cd "${projectPath}" && ${pathEnv} make iso`);
        }
    } catch (error) {
        throw error;
    }
}

// Function to download and extract a tool
async function downloadAndExtractTool(toolName) {
    try {
        const toolsUrls = JSON.parse(fs.readFileSync(path.join(extensionPath, 'tools-urls.json'), 'utf8'));
        
        // Get the current platform
        const platform = process.platform;
        
        // Find the tool for the current platform
        let tool = null;
        for (const [key, value] of Object.entries(toolsUrls)) {
            if (key === toolName || key.startsWith(toolName + '_')) {
                if (!value.platform || value.platform === platform) {
                    tool = value;
                    break;
                }
            }
        }
        
        if (!tool) {
            throw new Error(`Tool ${toolName} not found for platform ${platform}`);
        }
        
        const url = tool.url;
        const extractPath = path.join(extensionPath, tool.extractPath);
        const checkFile = path.join(extractPath, tool.checkFile);
        
        // Create the directory if it doesn't exist
        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
        }
        
        // Download the tool
        vscode.window.showInformationMessage(`Downloading ${toolName}...`);
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        // Extract the tool
        vscode.window.showInformationMessage(`Extracting ${toolName}...`);
        
        // Check if the file is a DMG (macOS disk image)
        if (url.endsWith('.dmg')) {
            // Save the DMG file
            const dmgPath = path.join(os.tmpdir(), `${toolName}.dmg`);
            fs.writeFileSync(dmgPath, Buffer.from(response.data));
            
            // Mount the DMG
            const mountPoint = path.join(os.tmpdir(), `${toolName}_mount`);
            if (!fs.existsSync(mountPoint)) {
                fs.mkdirSync(mountPoint, { recursive: true });
            }
            
            // Use hdiutil to mount the DMG
            await new Promise((resolve, reject) => {
                exec(`hdiutil attach "${dmgPath}" -mountpoint "${mountPoint}"`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
            
            // Copy the contents to the extract path
            await new Promise((resolve, reject) => {
                exec(`cp -R "${mountPoint}/"* "${extractPath}/"`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
            
            // Unmount the DMG
            await new Promise((resolve, reject) => {
                exec(`hdiutil detach "${mountPoint}"`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
            
            // Remove the DMG file
            fs.unlinkSync(dmgPath);
        } else {
            // Special handling for PSN00B_SDK which contains a folder structure
            if (toolName.includes('psn00b_sdk')) {
                // Create a temporary directory for extraction
                const tempExtractPath = path.join(os.tmpdir(), `${toolName}_temp`);
                if (fs.existsSync(tempExtractPath)) {
                    fse.removeSync(tempExtractPath);
                }
                fs.mkdirSync(tempExtractPath, { recursive: true });
                
                // Extract ZIP file to temp location
                const zip = new AdmZip(Buffer.from(response.data));
                zip.extractAllTo(tempExtractPath, true);
                
                // Clear the target directory
                if (fs.existsSync(extractPath)) {
                    fse.emptyDirSync(extractPath);
                } else {
                    fs.mkdirSync(extractPath, { recursive: true });
                }
                
                // Find the SDK folder in the temp directory
                const tempFiles = fs.readdirSync(tempExtractPath);
                let sdkFolderName = null;
                
                // Look for the main SDK folder (usually named PSn00bSDK or similar)
                for (const file of tempFiles) {
                    const filePath = path.join(tempExtractPath, file);
                    if (fs.statSync(filePath).isDirectory() && 
                        (file.toLowerCase().includes('psn00b') || file.toLowerCase().includes('sdk'))) {
                        sdkFolderName = file;
                        break;
                    }
                }
                
                if (sdkFolderName) {
                    // Move the SDK folder contents to the target location
                    const sdkFolderPath = path.join(tempExtractPath, sdkFolderName);
                    fse.copySync(sdkFolderPath, extractPath);
                } else {
                    // If no specific SDK folder found, copy everything
                    fse.copySync(tempExtractPath, extractPath);
                }
                
                // Clean up temp directory
                fse.removeSync(tempExtractPath);
            } else {
                // Extract ZIP file directly for other tools
                const zip = new AdmZip(Buffer.from(response.data));
                zip.extractAllTo(extractPath, true);
            }
        }
        
        // Check if the extraction was successful
        if (!fs.existsSync(checkFile)) {
            throw new Error(`Failed to extract ${toolName}. ${checkFile} not found.`);
        }
        
        // Make the file executable
        if (platform !== 'win32') {
            await new Promise((resolve, reject) => {
                exec(`chmod +x "${checkFile}"`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }
        
        vscode.window.showInformationMessage(`${toolName} installed successfully.`);
        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to download and extract ${toolName}: ${error.message}`);
        console.error(error);
        return false;
    }
}

// Helper function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
