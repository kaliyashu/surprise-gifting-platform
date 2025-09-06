#!/bin/bash

# Azure Deployment Script for Surprise Gifting Platform
# This script sets up Azure services and deploys your application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Azure Deployment for Surprise Gifting Platform${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first:${NC}"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please log in to Azure first:${NC}"
    az login
fi

# Configuration
RESOURCE_GROUP="surprise-gifting-rg"
LOCATION="eastus"
APP_SERVICE_PLAN="surprise-gifting-plan"
WEB_APP_NAME="surprise-gifting-app"
STATIC_WEB_APP_NAME="surprise-gifting-static"
POSTGRES_SERVER="surprise-gifting-db"
STORAGE_ACCOUNT="surprisegiftingstorage"
KEY_VAULT_NAME="surprise-gifting-kv"
APP_INSIGHTS_NAME="surprise-gifting-insights"
AD_B2C_TENANT="surprisegifting.onmicrosoft.com"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Web App: $WEB_APP_NAME"
echo "Static Web App: $STATIC_WEB_APP_NAME"
echo "Database: $POSTGRES_SERVER"
echo "Storage: $STORAGE_ACCOUNT"

# Create Resource Group
echo -e "${BLUE}🔧 Creating Resource Group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan (Free tier)
echo -e "${BLUE}📱 Creating App Service Plan (Free tier)...${NC}"
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku F1 \
    --is-linux

# Create Web App for Backend
echo -e "${BLUE}🌐 Creating Web App for Backend...${NC}"
az webapp create \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "NODE|18-lts"

# Create Static Web App for Frontend
echo -e "${BLUE}⚡ Creating Static Web App for Frontend...${NC}"
az staticwebapp create \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --source https://github.com/yourusername/surprise-gifting-platform \
    --branch main \
    --app-location "/client" \
    --api-location "/server" \
    --output-location "build"

# Create PostgreSQL Database
echo -e "${BLUE}🗄️  Creating PostgreSQL Database...${NC}"
az postgres flexible-server create \
    --name $POSTGRES_SERVER \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --admin-user postgres \
    --admin-password "YourSecurePassword123!" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32 \
    --version 15

# Create Storage Account
echo -e "${BLUE}💾 Creating Storage Account...${NC}"
az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --kind StorageV2

# Create Key Vault
echo -e "${BLUE}🔐 Creating Key Vault...${NC}"
az keyvault create \
    --name $KEY_VAULT_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku standard

# Create Application Insights
echo -e "${BLUE}📊 Creating Application Insights...${NC}"
az monitor app-insights component create \
    --app $APP_INSIGHTS_NAME \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --kind web

# Get connection strings and keys
echo -e "${BLUE}🔑 Getting connection strings and keys...${NC}"

# Get PostgreSQL connection string
POSTGRES_CONNECTION_STRING=$(az postgres flexible-server show-connection-string \
    --server-name $POSTGRES_SERVER \
    --admin-user postgres \
    --admin-password "YourSecurePassword123!" \
    --database-name surprise_moments \
    --query "connectionStrings.psql" \
    --output tsv)

# Get Storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query "connectionString" \
    --output tsv)

# Get App Insights connection string
APP_INSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show \
    --app $APP_INSIGHTS_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "ConnectionString" \
    --output tsv)

# Store secrets in Key Vault
echo -e "${BLUE}🔒 Storing secrets in Key Vault...${NC}"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "PostgreSQLConnectionString" --value "$POSTGRES_CONNECTION_STRING"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "StorageConnectionString" --value "$STORAGE_CONNECTION_STRING"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "AppInsightsConnectionString" --value "$APP_INSIGHTS_CONNECTION_STRING"

# Configure Web App environment variables
echo -e "${BLUE}⚙️  Configuring Web App environment variables...${NC}"
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $WEB_APP_NAME \
    --settings \
    NODE_ENV=production \
    DB_HOST="$POSTGRES_SERVER.postgres.database.azure.com" \
    DB_PORT=5432 \
    DB_NAME=surprise_moments \
    DB_USER=postgres \
    DB_PASSWORD="YourSecurePassword123!" \
    AZURE_KEY_VAULT_NAME="$KEY_VAULT_NAME" \
    AZURE_APP_INSIGHTS_CONNECTION_STRING="$APP_INSIGHTS_CONNECTION_STRING" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING"

# Enable continuous deployment for Static Web App
echo -e "${BLUE}🔄 Enabling continuous deployment...${NC}"
az staticwebapp update \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --source https://github.com/yourusername/surprise-gifting-platform \
    --branch main \
    --app-location "/client" \
    --api-location "/server" \
    --output-location "build"

# Create database tables
echo -e "${BLUE}📊 Setting up database schema...${NC}"
# This will be done by your application on first run

echo -e "${GREEN}✅ Azure deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}🌐 Your application URLs:${NC}"
echo "Frontend: https://$STATIC_WEB_APP_NAME.azurestaticapps.net"
echo "Backend API: https://$WEB_APP_NAME.azurewebsites.net"
echo ""
echo -e "${BLUE}🔑 Next steps:${NC}"
echo "1. Update your .env file with the new connection strings"
echo "2. Deploy your code to the Azure services"
echo "3. Test the application"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "- Change the default passwords"
echo "- Set up proper authentication"
echo "- Configure CORS settings"
echo "- Set up monitoring alerts"

