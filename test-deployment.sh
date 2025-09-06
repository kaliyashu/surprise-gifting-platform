#!/bin/bash

# Test Deployment Script for Surprise Gifting Platform
echo "🧪 Testing Surprise Gifting Platform Before Azure Deployment"
echo "================================================================"

# Test Node.js
echo "Testing Node.js..."
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Test npm
echo "Testing npm..."
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Test dependencies
echo "Testing dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Root dependencies installed"
else
    echo "⚠️  Installing root dependencies..."
    npm install
fi

if [ -d "server/node_modules" ]; then
    echo "✅ Server dependencies installed"
else
    echo "⚠️  Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ -d "client/node_modules" ]; then
    echo "✅ Client dependencies installed"
else
    echo "⚠️  Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Test build
echo "Testing build process..."
cd client
if npm run build >/dev/null 2>&1; then
    echo "✅ Client build successful"
else
    echo "❌ Client build failed"
    exit 1
fi
cd ..

# Test Azure CLI
echo "Testing Azure CLI..."
if command -v az >/dev/null 2>&1; then
    echo "✅ Azure CLI installed"
    if az account show >/dev/null 2>&1; then
        echo "✅ Logged in to Azure"
    else
        echo "⚠️  Not logged in to Azure (run 'az login')"
    fi
else
    echo "❌ Azure CLI not installed"
fi

echo ""
echo "🎉 Testing completed! Your app is ready for Azure deployment."
echo "Run './azure-deploy.sh' to deploy to Azure."


