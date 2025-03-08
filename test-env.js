const fs = require('fs');
const path = require('path');

// Extension paths
const extensionPath = __dirname;
const toolsPath = path.join(extensionPath, 'tools');
const gccPath = path.join(toolsPath, 'gcc');
const ps1SdkPath = path.join(toolsPath, 'psn00b_sdk');
const emulatorPath = path.join(toolsPath, 'emulator');

console.log('Checking PlayStation 1 development environment...');

// Check GCC
if (fs.existsSync(gccPath) && fs.readdirSync(gccPath).length > 0) {
    console.log('✅ GCC found at:', gccPath);
    
    // Check GCC binaries
    const gccBinPath = path.join(gccPath, 'bin');
    if (fs.existsSync(gccBinPath)) {
        console.log('  - GCC bin directory found');
        const files = fs.readdirSync(gccBinPath);
        console.log('  - Files found:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
    } else {
        console.log('❌ GCC bin directory not found');
    }
} else {
    console.log('❌ GCC not found or directory is empty');
}

// Check SDK
if (fs.existsSync(ps1SdkPath) && fs.readdirSync(ps1SdkPath).length > 0) {
    console.log('✅ PlayStation 1 SDK found at:', ps1SdkPath);
    
    // Check SDK include and lib directories
    const sdkIncludePath = path.join(ps1SdkPath, 'include');
    const sdkLibPath = path.join(ps1SdkPath, 'lib');
    
    if (fs.existsSync(sdkIncludePath)) {
        console.log('  - SDK include directory found');
        const files = fs.readdirSync(sdkIncludePath);
        console.log('  - Headers found:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
    } else {
        console.log('❌ SDK include directory not found');
    }
    
    if (fs.existsSync(sdkLibPath)) {
        console.log('  - SDK lib directory found');
        const files = fs.readdirSync(sdkLibPath);
        console.log('  - Libraries found:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
    } else {
        console.log('❌ SDK lib directory not found');
    }
} else {
    console.log('❌ PlayStation 1 SDK not found or directory is empty');
}

// Check Emulator
if (fs.existsSync(emulatorPath) && fs.readdirSync(emulatorPath).length > 0) {
    console.log('✅ PlayStation 1 emulator found at:', emulatorPath);
    const files = fs.readdirSync(emulatorPath);
    console.log('  - Files found:', files.join(', '));
} else {
    console.log('⚠️ PlayStation 1 emulator not found or directory is empty (optional)');
}

console.log('\nVerification completed!');
