# Script to package the PS1 Development extension for VSCode/Windsurf

# Check directory sizes
Write-Host "Checking directory sizes..."
$toolsSize = (Get-ChildItem -Path "tools" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Size of tools directory: $([math]::Round($toolsSize, 2)) MB"

# Check if vsce is installed
$vsceExists = Get-Command vsce -ErrorAction SilentlyContinue
if (-not $vsceExists) {
    Write-Host "vsce is not installed. Installing..."
    npm install -g @vscode/vsce
}

# Package the extension
Write-Host "Packaging the extension..."
vsce package

# Get version from package.json
$packageJson = Get-Content -Raw -Path "package.json" | ConvertFrom-Json
$version = $packageJson.version

# Rename the VSIX file to remove version
Rename-Item -Path "ps1-dev-extension-$version.vsix" -NewName "ps1-dev-extension.vsix" -Force

Write-Host "Package created successfully!"
Write-Host "To install manually in VS Code, use the command:"
Write-Host "code --install-extension ps1-dev-extension.vsix"
Write-Host ""
Write-Host "NOTE: This package does not include the large tools (GCC, SDK, Emulator)."
Write-Host "They will be downloaded automatically when the extension is installed."
