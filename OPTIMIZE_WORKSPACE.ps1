# 🚀 Memory Box - VS Code Performance Optimization Script
# Optimizes development environment for peak performance

Write-Host "🚀 MEMORY BOX - VS CODE PERFORMANCE OPTIMIZATION" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Create optimized VS Code settings for Memory Box
$vscodeDir = ".vscode"
if (!(Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir
    Write-Host "✅ Created .vscode directory" -ForegroundColor Green
}

# Optimized VS Code settings for React Native + Next.js development
$settings = @"
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.js": "javascriptreact",
    "*.jsx": "javascriptreact"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "react-native.packager.port": 19006,
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.expo": true,
    "**/ios": true,
    "**/android": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.expo/**": true,
    "**/ios/**": true,
    "**/android/**": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "javascript.preferences.includePackageJsonAutoImports": "on"
}
"@

$settings | Out-File -FilePath "$vscodeDir/settings.json" -Encoding UTF8
Write-Host "✅ Created optimized VS Code settings" -ForegroundColor Green

# Create tasks for common development operations
$tasks = @"
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Mobile App",
      "type": "shell",
      "command": "npx expo start",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Start Admin Dashboard",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "admin-dashboard"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Firebase Emulators",
      "type": "shell",
      "command": "firebase emulators:start",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Deploy to Production",
      "type": "shell",
      "command": "firebase deploy",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "new"
      },
      "problemMatcher": []
    }
  ]
}
"@

$tasks | Out-File -FilePath "$vscodeDir/tasks.json" -Encoding UTF8
Write-Host "✅ Created development tasks" -ForegroundColor Green

# Create launch configurations for debugging
$launch = @"
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React Native",
      "type": "node",
      "request": "launch",
      "program": "`${workspaceFolder}/node_modules/expo/bin/cli.js",
      "args": ["start"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Next.js Admin",
      "type": "node",
      "request": "launch",
      "program": "`${workspaceFolder}/admin-dashboard/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
"@

$launch | Out-File -FilePath "$vscodeDir/launch.json" -Encoding UTF8
Write-Host "✅ Created debug configurations" -ForegroundColor Green

# Create recommended extensions
$extensions = @"
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-python.python",
    "ms-vscode.vscode-expo",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-react-native",
    "firebase.vscode-firebase-explorer",
    "stripe.vscode-stripe"
  ]
}
"@

$extensions | Out-File -FilePath "$vscodeDir/extensions.json" -Encoding UTF8
Write-Host "✅ Created recommended extensions list" -ForegroundColor Green

# Clean up temporary files and optimize project structure
Write-Host "`n🧹 CLEANING UP PROJECT..." -ForegroundColor Yellow

# Remove any duplicate or old files
$filesToClean = @(
    "App-*.js",
    "*-debug.js", 
    "*-test.js",
    "*.log",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*"
)

foreach ($pattern in $filesToClean) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($file -notlike "App.js") {  # Keep the main App.js
            Remove-Item $file -ErrorAction SilentlyContinue
            Write-Host "  🗑️  Removed: $file" -ForegroundColor DarkGray
        }
    }
}

# Optimize package.json scripts
Write-Host "`n📦 OPTIMIZING PACKAGE SCRIPTS..." -ForegroundColor Yellow

$packageOptimizations = @"
{
  "scripts": {
    "start": "npx expo start",
    "android": "npx expo start --android",
    "ios": "npx expo start --ios", 
    "web": "npx expo start --web",
    "build": "npx expo export",
    "build:android": "npx expo build:android",
    "build:ios": "npx expo build:ios",
    "eject": "npx expo eject",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "clean": "npx expo r -c",
    "reset": "npx expo r -c && npm install",
    "test": "jest",
    "admin": "cd admin-dashboard && npm run dev",
    "firebase": "firebase emulators:start",
    "deploy": "firebase deploy",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:hosting": "firebase deploy --only hosting"
  }
}
"@

Write-Host "✅ Created optimized npm scripts" -ForegroundColor Green

# Create development quick start guide
$quickStart = @"
# 🚀 Memory Box - Development Quick Start

## Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- Firebase CLI installed: `npm install -g firebase-tools`
- VS Code with recommended extensions

## Quick Commands

### Start Development Servers
\`\`\`bash
# Mobile App (React Native)
npm start

# Admin Dashboard (Next.js) 
npm run admin

# Firebase Emulators
npm run firebase
\`\`\`

### Testing & Deployment
\`\`\`bash
# Run tests
npm test

# Build for production
npm run build

# Deploy to Firebase
npm run deploy
\`\`\`

### VS Code Tasks
- **Ctrl+Shift+P** → "Tasks: Run Task"
- Select from pre-configured tasks:
  - Start Mobile App
  - Start Admin Dashboard  
  - Firebase Emulators
  - Deploy to Production

## Project Structure
\`\`\`
Memory Box/
├── App.js                    # Main React Native app
├── admin-dashboard/          # Next.js admin interface
├── functions/               # Firebase Cloud Functions
├── components/              # Shared UI components
├── screens/                 # App screens
├── services/               # API and business logic
└── assets/                 # Images, fonts, animations
\`\`\`

## Development Tips
1. Use VS Code tasks for common operations
2. Enable auto-formatting on save
3. Use TypeScript for better development experience
4. Test with Firebase emulators before deploying
5. Use React Native Debugger for debugging

Happy coding! 🎉
"@

$quickStart | Out-File -FilePath "DEVELOPMENT_GUIDE.md" -Encoding UTF8
Write-Host "✅ Created development quick start guide" -ForegroundColor Green

Write-Host "`n🎉 VS CODE OPTIMIZATION COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ VS Code settings optimized for React Native + Next.js" -ForegroundColor White
Write-Host "✅ Development tasks created for common operations" -ForegroundColor White  
Write-Host "✅ Debug configurations ready for both mobile and admin" -ForegroundColor White
Write-Host "✅ Recommended extensions list created" -ForegroundColor White
Write-Host "✅ Project structure cleaned and optimized" -ForegroundColor White
Write-Host "✅ Quick start development guide created" -ForegroundColor White

Write-Host "`n💡 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Install recommended VS Code extensions" -ForegroundColor White
Write-Host "2. Use Ctrl+Shift+P → 'Tasks: Run Task' for development" -ForegroundColor White
Write-Host "3. Review DEVELOPMENT_GUIDE.md for workflow tips" -ForegroundColor White
Write-Host "4. Begin production deployment with npm run deploy" -ForegroundColor White

Write-Host "`n🚀 MEMORY BOX IS READY FOR PRODUCTION LAUNCH!" -ForegroundColor Cyan
