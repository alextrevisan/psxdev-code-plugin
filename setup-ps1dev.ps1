Set-ExecutionPolicy Bypass -Scope Process
irm "https://community.chocolatey.org/install.ps1" | iex; choco install msys2 -y; C:\tools\msys64\usr\bin\bash.exe -lc "pacman -Syuu --noconfirm; pacman -S --noconfirm make"; [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\tools\msys64\usr\bin", [System.EnvironmentVariableTarget]::Machine); $vcPath = "$env:TEMP\vc_redist.x64.exe"; Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vc_redist.x64.exe" -OutFile $vcPath; Start-Process -FilePath $vcPath -ArgumentList "/install /quiet /norestart" -Wait

# Download and install the PS1 development extension
$extensionUrl = "https://github.com/alextrevisan/psxdev-code-plugin/releases/latest/download/ps1-dev-extension.vsix"
$extensionPath = "$env:TEMP\ps1-dev-extension.vsix"
Write-Host "Downloading PS1 development extension..."
Invoke-WebRequest -Uri $extensionUrl -OutFile $extensionPath

# Check if VS Code is installed
$vscodePath = Get-Command code -ErrorAction SilentlyContinue
if ($vscodePath) {
    Write-Host "Installing PS1 development extension in VS Code..."
    & code --install-extension $extensionPath
    Write-Host "Extension installed successfully in VS Code!" -ForegroundColor Green
} else {
    # If VS Code is not in PATH, try common installation locations
    $commonPaths = @(
        "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
        "$env:ProgramFiles\Microsoft VS Code\bin\code.cmd",
        "$env:ProgramFiles(x86)\Microsoft VS Code\bin\code.cmd"
    )
    
    $installed = $false
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            Write-Host "Installing PS1 development extension in VS Code..."
            & $path --install-extension $extensionPath
            $installed = $true
            Write-Host "Extension installed successfully in VS Code!" -ForegroundColor Green
            break
        }
    }
    
    if (-not $installed) {
        Write-Host "VS Code not found. The extension has been downloaded to: $extensionPath" -ForegroundColor Yellow
        Write-Host "To install manually, open VS Code and run: code --install-extension $extensionPath" -ForegroundColor Yellow
    }
}

Write-Host "\nSetup complete! You're ready to develop PlayStation 1 applications." -ForegroundColor Green
