# VS Code Performance Optimization Script
Write-Host "🚀 Starting VS Code Performance Optimization..." -ForegroundColor Green

# Step 1: Close VS Code completely
Write-Host "📱 Closing VS Code..." -ForegroundColor Yellow
try {
    taskkill /f /im Code.exe 2>$null
    Start-Sleep -Seconds 2
    Write-Host "✅ VS Code closed successfully" -ForegroundColor Green
}
catch {
    Write-Host "ℹ️ VS Code was not running" -ForegroundColor Blue
}

# Step 2: Clear VS Code caches and storage
Write-Host "🧹 Clearing VS Code caches..." -ForegroundColor Yellow

$cachePaths = @(
    "$env:APPDATA\Code\User\workspaceStorage",
    "$env:APPDATA\Code\User\globalStorage", 
    "$env:APPDATA\Code\CachedExtensions",
    "$env:APPDATA\Code\logs",
    "$env:APPDATA\Code\User\History",
    "$env:APPDATA\Code\User\snippets",
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\resources\app\extensions"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        try {
            Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
            Write-Host "✅ Cleared: $path" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️ Could not clear: $path" -ForegroundColor Red
        }
    }
    else {
        Write-Host "ℹ️ Path not found: $path" -ForegroundColor Blue
    }
}

# Step 3: Clear system temp files
Write-Host "🗑️ Clearing system temp files..." -ForegroundColor Yellow
try {
    Remove-Item -Recurse -Force "$env:TEMP\*" -ErrorAction SilentlyContinue
    Write-Host "✅ System temp files cleared" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Some temp files could not be cleared" -ForegroundColor Yellow
}

# Step 4: Clear npm cache
Write-Host "📦 Clearing npm cache..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✅ npm cache cleared" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Could not clear npm cache" -ForegroundColor Red
}

Write-Host "`n🎉 VS Code optimization complete!" -ForegroundColor Green
Write-Host "💡 You can now restart VS Code for better performance" -ForegroundColor Cyan
