const fs = require('fs');
const path = require('path');

// Extension paths
const extensionPath = __dirname;
const toolsPath = path.join(extensionPath, 'tools');
const gccPath = path.join(toolsPath, 'gcc');
const ps1SdkPath = path.join(toolsPath, 'psn00b_sdk');
const emulatorPath = path.join(toolsPath, 'emulator');

console.log('Verificando ambiente de desenvolvimento PlayStation 1...');

// Verificar GCC
if (fs.existsSync(gccPath) && fs.readdirSync(gccPath).length > 0) {
    console.log('✅ GCC encontrado em:', gccPath);
    
    // Verificar binários do GCC
    const gccBinPath = path.join(gccPath, 'bin');
    if (fs.existsSync(gccBinPath)) {
        console.log('  - Diretório bin do GCC encontrado');
        const files = fs.readdirSync(gccBinPath);
        console.log('  - Arquivos encontrados:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
    } else {
        console.log('❌ Diretório bin do GCC não encontrado');
    }
} else {
    console.log('❌ GCC não encontrado ou diretório vazio');
}

// Verificar SDK
if (fs.existsSync(ps1SdkPath) && fs.readdirSync(ps1SdkPath).length > 0) {
    console.log('✅ SDK PlayStation 1 encontrado em:', ps1SdkPath);
    
    // Verificar include e lib do SDK
    const sdkIncludePath = path.join(ps1SdkPath, 'include');
    const sdkLibPath = path.join(ps1SdkPath, 'lib');
    
    if (fs.existsSync(sdkIncludePath)) {
        console.log('  - Diretório include do SDK encontrado');
        const files = fs.readdirSync(sdkIncludePath);
        console.log('  - Headers encontrados:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
    } else {
        console.log('❌ Diretório include do SDK não encontrado');
    }
    
    if (fs.existsSync(sdkLibPath)) {
        console.log('  - Diretório lib do SDK encontrado');
        const files = fs.readdirSync(sdkLibPath);
        console.log('  - Bibliotecas encontradas:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
    } else {
        console.log('❌ Diretório lib do SDK não encontrado');
    }
} else {
    console.log('❌ SDK PlayStation 1 não encontrado ou diretório vazio');
}

// Verificar Emulador
if (fs.existsSync(emulatorPath) && fs.readdirSync(emulatorPath).length > 0) {
    console.log('✅ Emulador PlayStation 1 encontrado em:', emulatorPath);
    const files = fs.readdirSync(emulatorPath);
    console.log('  - Arquivos encontrados:', files.join(', '));
} else {
    console.log('⚠️ Emulador PlayStation 1 não encontrado ou diretório vazio (opcional)');
}

console.log('\nVerificação concluída!');
