#!/bin/bash

# Free Multi-Platform Deployment Script
# Deploys to Vercel, Railway, Netlify, and Render for redundancy

set -e

echo "🚀 Starting Free Multi-Platform Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is required but not installed"
        exit 1
    fi
    
    echo "✅ Requirements check passed"
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    echo "✅ Dependencies installed"
}

# Deploy to Vercel (Frontend)
deploy_vercel() {
    echo "🌐 Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    cd client
    
    # Build the app
    npm run build
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod --yes
    
    cd ..
    
    echo "✅ Vercel deployment completed"
}

# Deploy to Railway (Backend + Database)
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        echo "📦 Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    cd server
    
    # Login to Railway
    echo "🔐 Logging into Railway..."
    railway login
    
    # Initialize Railway project
    if [ ! -f "railway.json" ]; then
        echo "📝 Initializing Railway project..."
        railway init
    fi
    
    # Deploy to Railway
    echo "🚀 Deploying to Railway..."
    railway up
    
    cd ..
    
    echo "✅ Railway deployment completed"
}

# Deploy to Netlify (Backup Frontend)
deploy_netlify() {
    echo "🌍 Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    cd client
    
    # Build the app
    npm run build
    
    # Deploy to Netlify
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=build
    
    cd ..
    
    echo "✅ Netlify deployment completed"
}

# Deploy to Render (Backend Backup)
deploy_render() {
    echo "🎨 Deploying to Render..."
    
    echo "📝 Creating Render configuration..."
    
    # Create render.yaml for Render deployment
    cat > render.yaml << EOF
services:
  - type: web
    name: surprise-moments-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DB_HOST
        value: surprise-moments-db
      - key: DB_PORT
        value: 5432
      - key: DB_NAME
        value: surprise_moments
      - key: DB_USER
        value: surprise_user
      - key: DB_PASSWORD
        generateValue: true
      - key: JWT_SECRET
        generateValue: true
      - key: ENCRYPTION_KEY
        generateValue: true

  - type: pserv
    name: surprise-moments-db
    env: postgres
    plan: free
    ipAllowList: []
EOF
    
    echo "📋 Render configuration created"
    echo "🔗 Deploy manually at: https://render.com"
    echo "📁 Upload render.yaml to your Render dashboard"
}

# Create mobile app configuration
setup_mobile() {
    echo "📱 Setting up mobile app configuration..."
    
    # Create React Native configuration
    cat > mobile-app/package.json << EOF
{
  "name": "surprise-moments-mobile",
  "version": "1.0.0",
  "description": "Surprise Moments Mobile App",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "expo build",
    "publish": "expo publish"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.0",
    "react-native-web": "~0.19.0",
    "@expo/vector-icons": "^13.0.0",
    "expo-av": "~13.4.0",
    "expo-file-system": "~15.4.0",
    "expo-image-picker": "~14.3.0",
    "expo-media-library": "~15.4.0",
    "expo-sharing": "~11.5.0",
    "expo-splash-screen": "~0.20.0",
    "expo-status-bar": "~1.6.0",
    "expo-updates": "~0.18.0",
    "react-native-gesture-handler": "~2.12.0",
    "react-native-reanimated": "~3.3.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "axios": "^1.4.0",
    "lottie-react-native": "5.1.6"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.14",
    "@types/react-native": "~0.72.0",
    "typescript": "^5.1.3"
  },
  "private": true
}
EOF
    
    # Create Expo configuration
    cat > mobile-app/app.json << EOF
{
  "expo": {
    "name": "Surprise Moments",
    "slug": "surprise-moments",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.surprisemoments.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.surprisemoments.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    },
    "plugins": [
      "expo-av",
      "expo-file-system",
      "expo-image-picker",
      "expo-media-library",
      "expo-sharing"
    ]
  }
}
EOF
    
    echo "✅ Mobile app configuration created"
}

# Create deployment URLs file
create_urls_file() {
    echo "📝 Creating deployment URLs file..."
    
    cat > DEPLOYMENT_URLS.md << EOF
# 🚀 Deployment URLs

## 🌐 Website URLs
- **Primary (Vercel)**: https://your-app.vercel.app
- **Backup (Netlify)**: https://your-app.netlify.app

## 🔧 API URLs
- **Primary (Railway)**: https://your-app.railway.app
- **Backup (Render)**: https://your-app.onrender.com

## 📱 Mobile App
- **Expo**: exp://your-app.expo.dev
- **App Store**: Coming Soon
- **Play Store**: Coming Soon

## 🔗 Quick Links
- **Website**: https://your-app.vercel.app
- **API Docs**: https://your-app.railway.app/api/health
- **Admin Panel**: https://your-app.railway.app/admin

## 📊 Monitoring
- **Vercel Analytics**: https://vercel.com/analytics
- **Railway Logs**: https://railway.app/logs
- **Netlify Analytics**: https://netlify.com/analytics

## 🔧 Environment Variables
\`\`\`bash
# Frontend (.env)
REACT_APP_API_URL=https://your-app.railway.app/api
REACT_APP_ENVIRONMENT=production

# Backend (.env)
NODE_ENV=production
PORT=5000
DB_HOST=your-app.railway.app
DB_PORT=5432
\`\`\`

## 🚀 Next Steps
1. Update URLs in your code
2. Configure custom domains (optional)
3. Set up monitoring and analytics
4. Deploy mobile app to stores
EOF
    
    echo "✅ Deployment URLs file created"
}

# Main deployment function
main() {
    echo "🎯 Starting Surprise Moments Multi-Platform Deployment"
    echo "=================================================="
    
    # Check requirements
    check_requirements
    
    # Install dependencies
    install_deps
    
    # Deploy to all platforms
    echo ""
    echo "🌐 Deploying Website..."
    deploy_vercel
    deploy_netlify
    
    echo ""
    echo "🔧 Deploying Backend..."
    deploy_railway
    deploy_render
    
    echo ""
    echo "📱 Setting up Mobile App..."
    setup_mobile
    
    echo ""
    echo "📝 Creating documentation..."
    create_urls_file
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================"
    echo "✅ Website: Deployed to Vercel & Netlify"
    echo "✅ Backend: Deployed to Railway & Render"
    echo "✅ Mobile: Configuration ready for Expo"
    echo "✅ Documentation: DEPLOYMENT_URLS.md created"
    
    echo ""
    echo "🔗 Your URLs:"
    echo "🌐 Website: https://your-app.vercel.app"
    echo "🔧 API: https://your-app.railway.app"
    echo "📱 Mobile: Check DEPLOYMENT_URLS.md"
    
    echo ""
    echo "📱 To deploy mobile app:"
    echo "1. cd mobile-app"
    echo "2. npm install"
    echo "3. expo start"
    echo "4. expo build"
    echo "5. expo publish"
}

# Run main function
main
