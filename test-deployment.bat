@echo off
echo 🧪 Testing Surprise Gifting Platform Before Azure Deployment
echo ================================================================

REM Test Node.js
echo Testing Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js version: 
    node --version
) else (
    echo ❌ Node.js not found
    exit /b 1
)

REM Test npm
echo Testing npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm version: 
    npm --version
) else (
    echo ❌ npm not found
    exit /b 1
)

REM Test dependencies
echo Testing dependencies...
if exist "node_modules" (
    echo ✅ Root dependencies installed
) else (
    echo ⚠️  Installing root dependencies...
    npm install
)

if exist "server\node_modules" (
    echo ✅ Server dependencies installed
) else (
    echo ⚠️  Installing server dependencies...
    cd server && npm install && cd ..
)

if exist "client\node_modules" (
    echo ✅ Client dependencies installed
) else (
    echo ⚠️  Installing client dependencies...
    cd client && npm install && cd ..
)

REM Test build
echo Testing build process...
cd client
npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Client build successful
) else (
    echo ❌ Client build failed
    exit /b 1
)
cd ..

REM Test Azure CLI
echo Testing Azure CLI...
az --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Azure CLI installed
    az account show >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Logged in to Azure
    ) else (
        echo ⚠️  Not logged in to Azure (run 'az login')
    )
) else (
    echo ❌ Azure CLI not installed
)

echo.
echo 🎉 Testing completed! Your app is ready for Azure deployment.
echo Run 'azure-deploy.sh' to deploy to Azure.
pause
