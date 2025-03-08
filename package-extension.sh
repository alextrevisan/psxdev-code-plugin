#!/bin/bash

# Check directory sizes
echo "Checking directory sizes..."
TOOLS_SIZE=$(du -sh tools | cut -f1)
echo "Size of tools directory: $TOOLS_SIZE"

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "vsce is not installed. Installing..."
    npm install -g vsce
fi

# Package the extension
echo "Packaging the extension..."
vsce package

echo "Package created successfully!"
echo "To install manually in VS Code, use the command:"
echo "code --install-extension ps1-dev-extension-0.1.0.vsix"
echo ""
echo "NOTE: This package does not include the large tools (GCC, SDK, Emulator)."
echo "They will be downloaded automatically when the extension is installed."
