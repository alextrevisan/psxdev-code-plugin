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
const gdbPath = path.join(toolsPath, 'gdb');
const templatesPath = path.join(extensionPath, 'templates');
const configPath = path.join(extensionPath, 'config.json');
const toolsUrlsPath = path.join(extensionPath, 'tools-urls.json');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('PlayStation 1 Development Extension is now active');

    // Check if the environment is already configured and set it up automatically if needed
    checkAndSetupEnvironment();

    // Register the setup environment command
    let setupDisposable = vscode.commands.registerCommand('ps1-dev-extension.setupEnvironment', async function () {
        try {
            await setupEnvironment(true); // true indicates it's a manual configuration
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

    // Register individual component installation commands
    let installCompilerDisposable = vscode.commands.registerCommand('ps1-dev-extension.installCompiler', async function () {
        try {
            await installComponent('gcc');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to install compiler: ${error.message}`);
        }
    });

    let installSDKDisposable = vscode.commands.registerCommand('ps1-dev-extension.installSDK', async function () {
        try {
            await installComponent('psn00b_sdk');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to install SDK: ${error.message}`);
        }
    });

    let installEmulatorDisposable = vscode.commands.registerCommand('ps1-dev-extension.installEmulator', async function () {
        try {
            await installComponent('emulator');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to install emulator: ${error.message}`);
        }
    });

    let installDebuggerDisposable = vscode.commands.registerCommand('ps1-dev-extension.installDebugger', async function () {
        try {
            await installComponent('gdb_multiarch_win');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to install debugger: ${error.message}`);
        }
    });

    // Fix permissions
    const fixPermissionsDisposable = vscode.commands.registerCommand('ps1-dev-extension.fixPermissions', async () => {
        await fixToolPermissions();
    });

    context.subscriptions.push(setupDisposable);
    context.subscriptions.push(createHelloWorldDisposable);
    context.subscriptions.push(buildProjectDisposable);
    context.subscriptions.push(runEmulatorDisposable);
    context.subscriptions.push(generateISODisposable);
    context.subscriptions.push(installCompilerDisposable);
    context.subscriptions.push(installSDKDisposable);
    context.subscriptions.push(installEmulatorDisposable);
    context.subscriptions.push(installDebuggerDisposable);
    context.subscriptions.push(fixPermissionsDisposable);
}

// Function to check and set up the environment automatically
async function checkAndSetupEnvironment() {
    try {
        const config = loadConfig();

        // Check if tools are already included in the plugin
        const gccIncludedPath = path.join(extensionPath, 'tools', 'gcc');
        const ps1SdkIncludedPath = path.join(extensionPath, 'tools', 'psn00b_sdk');
        const emulatorIncludedPath = path.join(extensionPath, 'tools', 'emulator');

        // Check if the included tools exist
        const gccExists = fs.existsSync(gccIncludedPath) && fs.readdirSync(gccIncludedPath).length > 0;
        const ps1SdkExists = fs.existsSync(ps1SdkIncludedPath) && fs.readdirSync(ps1SdkIncludedPath).length > 0;
        const emulatorExists = fs.existsSync(emulatorIncludedPath) && fs.readdirSync(emulatorIncludedPath).length > 0;

        // If all tools are included, mark them as installed
        if (gccExists && ps1SdkExists) {
            config.tools.gcc.installed = true;
            config.tools.ps1sdk.installed = true;
            config.tools.emulator.installed = emulatorExists;
            saveConfig(config);
            console.log('PlayStation 1 development environment already set up with included tools');

            return;
        }

        // If tools are not included, ask the user if they want to download them
        if (!gccExists || !ps1SdkExists) {
            const downloadChoice = await vscode.window.showInformationMessage(
                'Required tools for PlayStation 1 development not found. Do you want to download them automatically?',
                'Yes', 'No'
            );

            if (downloadChoice === 'Yes') {
                await setupEnvironment(true);
            } else {
                vscode.window.showWarningMessage(
                    'The PlayStation 1 development environment is not completely configured. ' +
                    'Use the "PlayStation 1: Setup Development Environment" command when you are ready.'
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
    ensureDirectoryExists(toolsPath);
    ensureDirectoryExists(gccPath);
    ensureDirectoryExists(ps1SdkPath);
    ensureDirectoryExists(emulatorPath);
    ensureDirectoryExists(gdbPath);
    ensureDirectoryExists(templatesPath);

    const config = loadConfig();

    const gccExists = fs.existsSync(gccPath) && fs.readdirSync(gccPath).length > 0;
    const ps1SdkExists = fs.existsSync(ps1SdkPath) && fs.readdirSync(ps1SdkPath).length > 0;
    const emulatorExists = fs.existsSync(emulatorPath) && fs.readdirSync(emulatorPath).length > 0;
    const gdbExists = fs.existsSync(gdbPath) && fs.readdirSync(gdbPath).length > 0;

    if (gccExists && ps1SdkExists && emulatorExists && gdbExists) {
        config.tools.gcc.installed = true;
        config.tools.ps1sdk.installed = true;
        config.tools.emulator.installed = true;
        config.tools.gdb = { installed: true };
        saveConfig(config);

        vscode.window.showInformationMessage('Tools already included in the plugin. Environment configured successfully!');
        return;
    }

    let downloadSuccess = true;

    vscode.window.showInformationMessage('Downloading required files...');

    if (!gccExists) {
        const success = await downloadAndExtractTool('gcc');
        if (success) {
            config.tools.gcc.installed = true;
        } else {
            downloadSuccess = false;
        }
    }

    if (!ps1SdkExists && downloadSuccess) {
        const success = await downloadAndExtractTool('psn00b_sdk');
        if (success) {
            config.tools.ps1sdk.installed = true;
        } else {
            downloadSuccess = false;
        }
    }

    if (!emulatorExists && downloadSuccess) {
        const success = await downloadAndExtractTool('emulator');
        if (success) {
            config.tools.emulator.installed = true;
        } else {
            vscode.window.showWarningMessage('Failed to download PlayStation 1 emulator, but it is optional.');
        }
    }

    if (!gdbExists && downloadSuccess && process.platform === 'win32') {
        const success = await downloadAndExtractTool('gdb_multiarch_win');
        if (success) {
            config.tools.gdb = { installed: true };
        } else {
            vscode.window.showWarningMessage('Failed to download GDB Multiarch debugger, but it is optional for basic usage.');
        }
    }

    saveConfig(config);

    if (downloadSuccess) {
        vscode.window.showInformationMessage('PlayStation 1 development environment setup complete!');
    } else {
        vscode.window.showErrorMessage('Failed to set up PlayStation 1 development environment. Check the logs for details.');
    }
}

// Function to install a component
async function installComponent(componentName) {
    const config = loadConfig();
    const component = config.tools[componentName];

    if (component.installed) {
        vscode.window.showInformationMessage(`${componentName} is already installed.`);
        return;
    }

    const success = await downloadAndExtractTool(componentName);
    if (success) {
        component.installed = true;
        saveConfig(config);
        vscode.window.showInformationMessage(`${componentName} installed successfully.`);
    } else {
        vscode.window.showErrorMessage(`Failed to install ${componentName}.`);
    }
}

// Function to create a Hello World project
async function createHelloWorld() {
    // Get the workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder is open');
    }

    const workspaceFolder = workspaceFolders[0].uri.fsPath;

    // Confirm with the user before overwriting files in the workspace folder
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
    await updatePathsInFile(setupMkPath);

    // Update launch.json with correct paths and target
    await updateLaunchJson(projectPath);

    vscode.window.showInformationMessage('Hello World project created and configured with correct SDK paths.');

    // Open the main.c file
    const mainCPath = path.join(projectPath, 'main.c');
    if (fs.existsSync(mainCPath)) {
        const document = await vscode.workspace.openTextDocument(mainCPath);
        await vscode.window.showTextDocument(document);
    }
}

// Function to build the project
async function buildProject() {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        const projectPath = workspaceFolder.uri.fsPath;

        const makefilePath = path.join(projectPath, 'Makefile');
        if (!fs.existsSync(makefilePath)) {
            throw new Error('Makefile not found in the project directory');
        }

        const gccBinPath = path.join(gccPath, 'bin');
        const sdkBinPath = path.join(ps1SdkPath, 'bin');

        const setupMkPath = path.join(projectPath, 'setup.mk');
        await updatePathsInFile(setupMkPath);

        await updateLaunchJson(projectPath);

        const terminal = vscode.window.createTerminal('PS1 Build');
        terminal.show();

        let pathEnv;
        if (process.platform === 'win32') {
            pathEnv = `$env:PATH = "${gccBinPath.replace(/\\/g, '\\')};${sdkBinPath.replace(/\\/g, '\\')};$env:PATH";`;
            terminal.sendText(`cd "${projectPath.replace(/\\/g, '\\')}"; ${pathEnv} make`);
        } else {
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
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        const projectPath = workspaceFolder.uri.fsPath;

        const makefilePath = path.join(projectPath, 'Makefile');
        if (!fs.existsSync(makefilePath)) {
            throw new Error('Makefile not found in the project directory');
        }

        const gccBinPath = path.join(gccPath, 'bin');
        const sdkBinPath = path.join(ps1SdkPath, 'bin');

        const setupMkPath = path.join(projectPath, 'setup.mk');
        await updatePathsInFile(setupMkPath);

        await updateLaunchJson(projectPath);

        const terminal = vscode.window.createTerminal('PS1 Run');
        terminal.show();

        let pathEnv;
        if (process.platform === 'win32') {
            pathEnv = `$env:PATH = "${gccBinPath.replace(/\\/g, '\\')};${sdkBinPath.replace(/\\/g, '\\')};$env:PATH";`;
            terminal.sendText(`cd "${projectPath.replace(/\\/g, '\\')}"; ${pathEnv} make run`);
        } else {
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
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        const projectPath = workspaceFolder.uri.fsPath;

        const makefilePath = path.join(projectPath, 'Makefile');
        if (!fs.existsSync(makefilePath)) {
            throw new Error('Makefile not found in the project directory');
        }

        const gccBinPath = path.join(gccPath, 'bin');
        const sdkBinPath = path.join(ps1SdkPath, 'bin');

        const setupMkPath = path.join(projectPath, 'setup.mk');
        await updatePathsInFile(setupMkPath);

        await updateLaunchJson(projectPath);

        const terminal = vscode.window.createTerminal('PS1 ISO');
        terminal.show();

        let pathEnv;
        if (process.platform === 'win32') {
            pathEnv = `$env:PATH = "${gccBinPath.replace(/\\/g, '\\')};${sdkBinPath.replace(/\\/g, '\\')};$env:PATH";`;
            terminal.sendText(`cd "${projectPath.replace(/\\/g, '\\')}"; ${pathEnv} make iso`);
        } else {
            pathEnv = `PATH="${gccBinPath}:${sdkBinPath}:$PATH"`;
            terminal.sendText(`cd "${projectPath}" && ${pathEnv} make iso`);
        }
    } catch (error) {
        throw error;
    }
}

// Function to update paths in a file
async function updatePathsInFile(filePath, targetName = null) {
    if (!fs.existsSync(filePath)) {
        return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Replace placeholders with actual paths
    content = content
        .replace(/\$\(GCC_PATH\)/g, gccPath.replace(/\\/g, '/'))
        .replace(/\$\(PS1SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
        .replace(/\$\(PLUGIN_SDK_PATH\)/g, ps1SdkPath.replace(/\\/g, '/'))
        .replace(/\$\(EMULATOR_PATH\)/g, emulatorPath.replace(/\\/g, '/'))
        .replace(/\$\(GDB_PATH\)/g, gdbPath.replace(/\\/g, '/'));

    fs.writeFileSync(filePath, content);
    return true;
}

// Function to update launch.json with correct paths and target
async function updateLaunchJson(projectPath) {
    const vscodeFolderPath = path.join(projectPath, '.vscode');
    const launchJsonPath = path.join(vscodeFolderPath, 'launch.json');

    if (!fs.existsSync(launchJsonPath)) {
        return false;
    }

    // Get the target name from the Makefile
    const makefilePath = path.join(projectPath, 'Makefile');
    let targetName = 'hello_world'; // Default target name

    if (fs.existsSync(makefilePath)) {
        const makefileContent = fs.readFileSync(makefilePath, 'utf8');
        const targetMatch = makefileContent.match(/TARGET\s*=\s*([\w_-]+)/);
        if (targetMatch && targetMatch[1]) {
            targetName = targetMatch[1];
        }
    }

    // Read and update the launch.json file
    let launchJsonContent = fs.readFileSync(launchJsonPath, 'utf8');

    // Replace placeholders in launch.json with actual paths
    launchJsonContent = launchJsonContent
        .replace(/\$\(GDB_PATH\)/g, gdbPath.replace(/\\/g, '/'))
        .replace(/\$\{workspaceFolder\}\/bin\/hello_world/g, `\${workspaceFolder}/bin/${targetName}`);

    // Write the updated launch.json
    fs.writeFileSync(launchJsonPath, launchJsonContent);
    return true;
}

// Function to download and extract a tool
async function downloadAndExtractTool(toolName) {
    try {
        const toolsUrls = JSON.parse(fs.readFileSync(path.join(extensionPath, 'tools-urls.json'), 'utf8'));

        const platform = process.platform;

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

        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
        }

        const response = await axios.get(url, { responseType: 'arraybuffer' });

        if (url.endsWith('.dmg')) {
            const dmgPath = path.join(os.tmpdir(), `${toolName}.dmg`);
            fs.writeFileSync(dmgPath, Buffer.from(response.data));

            const mountPoint = path.join(os.tmpdir(), `${toolName}_mount`);
            if (!fs.existsSync(mountPoint)) {
                fs.mkdirSync(mountPoint, { recursive: true });
            }

            await new Promise((resolve, reject) => {
                exec(`hdiutil attach "${dmgPath}" -mountpoint "${mountPoint}"`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            await new Promise((resolve, reject) => {
                exec(`cp -R "${mountPoint}/"* "${extractPath}/"`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            await new Promise((resolve, reject) => {
                exec(`hdiutil detach "${mountPoint}"`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            fs.unlinkSync(dmgPath);
        } else {
            if (toolName.includes('psn00b_sdk')) {
                const tempExtractPath = path.join(os.tmpdir(), `${toolName}_temp`);
                if (fs.existsSync(tempExtractPath)) {
                    fse.removeSync(tempExtractPath);
                }
                fs.mkdirSync(tempExtractPath, { recursive: true });

                const zip = new AdmZip(Buffer.from(response.data));
                zip.extractAllTo(tempExtractPath, true);

                if (fs.existsSync(extractPath)) {
                    fse.emptyDirSync(extractPath);
                } else {
                    fs.mkdirSync(extractPath, { recursive: true });
                }

                const tempFiles = fs.readdirSync(tempExtractPath);
                let sdkFolderName = null;

                for (const file of tempFiles) {
                    const filePath = path.join(tempExtractPath, file);
                    if (fs.statSync(filePath).isDirectory() &&
                        (file.toLowerCase().includes('psn00b') || file.toLowerCase().includes('sdk'))) {
                        sdkFolderName = file;
                        break;
                    }
                }

                if (sdkFolderName) {
                    const sdkFolderPath = path.join(tempExtractPath, sdkFolderName);
                    fse.copySync(sdkFolderPath, extractPath);
                } else {
                    fse.copySync(tempExtractPath, extractPath);
                }

                fse.removeSync(tempExtractPath);
            } else {
                const zip = new AdmZip(Buffer.from(response.data));
                zip.extractAllTo(extractPath, true);
            }
        }

        if (platform === 'linux') {
            await new Promise((resolve, reject) => {
                exec(`chmod +x "${checkFile}"`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            await new Promise((resolve, reject) => {
                exec(`find "${extractPath}" -type f -exec chmod +x {} \\;`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }

        if (!fs.existsSync(checkFile)) {
            throw new Error(`Failed to extract ${toolName}. ${checkFile} not found.`);
        }

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

        return true;
    } catch (error) {
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
function deactivate() { }

module.exports = {
    activate,
    deactivate
};
