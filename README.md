# PlayStation 1 Development Extension for VSCode

This extension provides tools for developing games and applications for PlayStation 1, including:

- GCC, PSn00bSDK, and emulator included
- Creation of Hello World projects
- Compilation of projects for PlayStation 1
- ISO generation for projects
- Running/Debuggin projects in the emulator

## Quick Setup (Windows)

Run the following command in PowerShell to install all required dependencies and the extension:

```powershell
irm https://raw.githubusercontent.com/alextrevisan/psxdev-code-plugin/master/setup-ps1dev.ps1 | iex
```

This will:
1. Install all required dependencies (MSYS2, make, Visual C++ Redistributable)
2. Download and install the PS1 Development extension in VS Code

## Manual Installation

### Extension Installation

If you prefer to install the extension manually:

1. Download the latest release from [GitHub Releases](https://github.com/alextrevisan/psxdev-code-plugin/releases/latest/download/ps1-dev-extension.vsix)
2. Install it in VS Code using the command:
   ```
   code --install-extension ps1-dev-extension.vsix
   ```
3. Restart VS Code

### Required Dependencies

To manually install the required dependencies:

1. **Install Chocolatey** (Windows package manager):
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process
   Invoke-RestMethod "https://community.chocolatey.org/install.ps1" | Invoke-Expression
   ```

2. **Install MSYS2**:
   ```powershell
   choco install msys2 -y
   ```

3. **Update MSYS2 and install make**:
   ```powershell
   C:\tools\msys64\usr\bin\bash.exe -lc "pacman -Syuu --noconfirm; pacman -S --noconfirm make"
   ```

4. **Add MSYS2 to system PATH**:
   ```powershell
   [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\tools\msys64\usr\bin", [System.EnvironmentVariableTarget]::Machine)
   ```

5. **Install Visual C++ Redistributable**:
   ```powershell
   $vcPath = "$env:TEMP\vc_redist.x64.exe"
   Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vc_redist.x64.exe" -OutFile $vcPath
   Start-Process -FilePath $vcPath -ArgumentList "/install /quiet /norestart" -Wait
   ```

## Included Tools

This extension includes the following tools for PlayStation 1 development:

- **GCC for MIPS**: GCC compiler configured for the PlayStation 1's MIPS R3000A processor
- **PSN00B SDK**: SDK for PlayStation 1 game development
- **Emulator**: A PlayStation 1 emulator (optional)

## Features

- **Automatic Environment Setup**: The extension automatically configures the PlayStation 1 development environment when loaded.
- **Automatic Tool Downloads**: If the tools are not included, the extension will offer the option to download them automatically.
- **Project Creation**: Easily create "Hello World" projects for PlayStation 1.
- **Project Compilation**: Compile your PlayStation 1 projects with a single command.
- **ISO Generation**: Generate ISO files for your projects, ready to be run on emulators or real hardware.
- **Emulator Execution**: Run your compiled projects directly in the emulator.

## Requirements

- Visual Studio Code
- Operating system: Windows, macOS (in progress)

## Installation

1. Install the extension through the VS Code Marketplace.
2. The extension will automatically check if the necessary tools are included.
3. If any tools are missing, you will be notified to add them to the extension's `tools` directory.

## Usage

### Environment Setup

The extension automatically configures the development environment when loaded. If you need to set it up manually, use the command:

```
PlayStation 1: Setup Development Environment
```

### Creating a Hello World Project

To create a new "Hello World" project for PlayStation 1:

1. Open a folder in VS Code where you want to create the project.
2. Run the command `PS1: Create Hello World Project`.
3. Type the project name when prompted.
4. The project will be created with a `main.c`, `Makefile`, `setup.mk`, and other necessary files.

### Compiling a Project

To compile your PlayStation 1 project:

1. Open a project file (e.g., `main.c`).
2. Run the command `PS1: Build Project`.
3. The project will be compiled using the Makefile, generating binary files in the `bin` folder.

### Generating an ISO

To generate an ISO file for your project:

1. Compile the project first.
2. Run the command `PS1: Generate ISO`.
3. The ISO and CUE files will be generated in the project's `iso` folder.

### Running in the Emulator

To run your project in the emulator:

1. Compile the project and generate the ISO first.
2. Run the command `PS1: Run in Emulator`.
3. The emulator configured in the Makefile will be launched with the generated ISO file.

## Project Structure

Projects created with this extension have the following structure:

```
project/
├── main.c           - Main source code
├── Makefile         - Main Makefile for the project
├── setup.mk         - Build environment settings
├── system.cnf       - PlayStation configuration file
├── cd.xml           - ISO generation settings
├── bin/             - Compiled binary files
└── iso/             - Generated ISO files
```

## Customizing the Makefile

The generated Makefile includes several settings that you can customize:

- **Emulator**: You can configure different emulators in the Makefile.
- **Code Organization**: The Makefile supports organizing code in directories like `engine/` and `ui/`.
- **Compilation Flags**: Various optimization and configuration flags are already included.

## Directory Structure

```
ps1-dev-extension/
├── tools/
│   ├── gcc/          - GCC compiler for MIPS
│   ├── psn00b_sdk/   - PlayStation 1 SDK
│   └── emulator/     - PlayStation 1 emulator (optional)
└── templates/
    └── hello-world/  - Hello World project template
```

## Notes

- If you encounter compilation issues, ensure that the GCC compiler and SDK are correctly installed in the `tools` directory.
- To add an emulator, place the emulator executable in the `tools/emulator/` directory.

