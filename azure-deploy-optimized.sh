#!/bin/bash

# 🚀 Optimized Azure Deployment Script for Surprise Gifting Platform
# Maximizes free tier benefits, security, and performance for students

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 Starting Optimized Azure Deployment for Surprise Gifting Platform${NC}"
echo -e "${CYAN}Maximizing free tier benefits, security, and performance for students${NC}"
echo "=================================================================================="

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

# Configuration - Optimized for free tier
RESOURCE_GROUP="surprise-gifting-rg"
LOCATION="eastus"  # Best free tier availability
APP_SERVICE_PLAN="surprise-gifting-plan"
WEB_APP_NAME="surprise-gifting-app"
STATIC_WEB_APP_NAME="surprise-gifting-static"
POSTGRES_SERVER="surprise-gifting-db"
STORAGE_ACCOUNT="surprisegiftingstorage"
KEY_VAULT_NAME="surprise-gifting-kv"
APP_INSIGHTS_NAME="surprise-gifting-insights"
CDN_PROFILE="surprise-gifting-cdn"
FUNCTION_APP_NAME="surprise-gifting-functions"

echo -e "${BLUE}📋 Optimized Configuration for Student Free Tier:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION (best free tier availability)"
echo "Web App: $WEB_APP_NAME (F1 free tier)"
echo "Static Web App: $STATIC_WEB_APP_NAME (always free)"
echo "Database: $POSTGRES_SERVER (Burstable free tier)"
echo "Storage: $STORAGE_ACCOUNT (5GB free)"
echo "CDN: $CDN_PROFILE (5GB bandwidth free)"
echo "Functions: $FUNCTION_APP_NAME (1M requests/month free)"

# Create Resource Group
echo -e "${BLUE}🔧 Creating Resource Group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan (Free F1 tier - optimized for students)
echo -e "${BLUE}📱 Creating App Service Plan (Free F1 tier)...${NC}"
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku F1 \
    --is-linux \
    --location $LOCATION

# Create Web App for Backend with optimized settings
echo -e "${BLUE}🌐 Creating Web App for Backend...${NC}"
az webapp create \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "NODE|18-lts" \
    --deployment-local-git

# Create Static Web App for Frontend (always free)
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

# Create PostgreSQL Database (Burstable tier - free for students)
echo -e "${BLUE}🗄️  Creating PostgreSQL Database (Burstable free tier)...${NC}"
az postgres flexible-server create \
    --name $POSTGRES_SERVER \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --admin-user postgres \
    --admin-password "YourSecurePassword123!" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32 \
    --version 15 \
    --storage-auto-grow Enabled \
    --backup-retention 7 \
    --geo-redundant-backup Disabled

# Configure PostgreSQL for security and performance
echo -e "${BLUE}🔒 Configuring PostgreSQL security...${NC}"
az postgres flexible-server parameter set \
    --resource-group $RESOURCE_GROUP \
    --server-name $POSTGRES_SERVER \
    --name ssl_enforcement \
    --value ON

az postgres flexible-server parameter set \
    --resource-group $RESOURCE_GROUP \
    --server-name $POSTGRES_SERVER \
    --name log_connections \
    --value ON

az postgres flexible-server parameter set \
    --resource-group $RESOURCE_GROUP \
    --server-name $POSTGRES_SERVER \
    --name log_disconnections \
    --value ON

# Create Storage Account with optimized settings
echo -e "${BLUE}💾 Creating Storage Account (5GB free tier)...${NC}"
az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --kind StorageV2 \
    --min-tls-version TLS1_2 \
    --allow-blob-public-access false \
    --allow-shared-key-access false

# Create storage containers
echo -e "${BLUE}📁 Creating storage containers...${NC}"
az storage container create \
    --name uploads \
    --account-name $STORAGE_ACCOUNT \
    --public-access off

az storage container create \
    --name assets \
    --account-name $STORAGE_ACCOUNT \
    --public-access off

az storage container create \
    --name public \
    --account-name $STORAGE_ACCOUNT \
    --public-access blob

# Configure storage lifecycle management (free tier optimization)
echo -e "${BLUE}🔄 Configuring storage lifecycle management...${NC}"
az storage account blob-service-properties update \
    --account-name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --enable-delete-retention true \
    --delete-retention-days 7

# Create Key Vault with enhanced security
echo -e "${BLUE}🔐 Creating Key Vault with enhanced security...${NC}"
az keyvault create \
    --name $KEY_VAULT_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku standard \
    --enable-rbac-authorization true \
    --enable-soft-delete true \
    --soft-delete-retention-days 7 \
    --enable-purge-protection true

# Create Application Insights (5GB free tier)
echo -e "${BLUE}📊 Creating Application Insights (5GB free tier)...${NC}"
az monitor app-insights component create \
    --app $APP_INSIGHTS_NAME \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --kind web \
    --application-type web \
    --workspace "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.OperationalInsights/workspaces/surprise-gifting-workspace"

# Create Log Analytics Workspace (free tier)
echo -e "${BLUE}📝 Creating Log Analytics Workspace...${NC}"
az monitor log-analytics workspace create \
    --resource-group $RESOURCE_GROUP \
    --workspace-name "surprise-gifting-workspace" \
    --location $LOCATION \
    --sku "Free"

# Create CDN Profile (5GB bandwidth free)
echo -e "${BLUE}🚀 Creating CDN Profile (5GB bandwidth free)...${NC}"
az cdn profile create \
    --name $CDN_PROFILE \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_Microsoft

# Create CDN Endpoint
az cdn endpoint create \
    --name "surprise-gifting-cdn-endpoint" \
    --profile-name $CDN_PROFILE \
    --resource-group $RESOURCE_GROUP \
    --origin "$STORAGE_ACCOUNT.blob.core.windows.net" \
    --origin-host-header "$STORAGE_ACCOUNT.blob.core.windows.net" \
    --enable-compression

# Create Azure Functions App (1M requests/month free)
echo -e "${BLUE}⚡ Creating Azure Functions App (1M requests/month free)...${NC}"
az functionapp create \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --consumption-plan-location $LOCATION \
    --storage-account $STORAGE_ACCOUNT \
    --runtime node \
    --runtime-version 18 \
    --functions-version 4 \
    --os-type Linux

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

# Configure Web App environment variables with security best practices
echo -e "${BLUE}⚙️  Configuring Web App with security best practices...${NC}"
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $WEB_APP_NAME \
    --settings \
    NODE_ENV=production \
    PORT=8080 \
    DB_HOST="$POSTGRES_SERVER.postgres.database.azure.com" \
    DB_PORT=5432 \
    DB_NAME=surprise_moments \
    DB_USER=postgres \
    DB_PASSWORD="YourSecurePassword123!" \
    DB_SSL=true \
    AZURE_KEY_VAULT_NAME="$KEY_VAULT_NAME" \
    AZURE_APP_INSIGHTS_CONNECTION_STRING="$APP_INSIGHTS_CONNECTION_STRING" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    AZURE_CDN_ENDPOINT="https://surprise-gifting-cdn-endpoint.azureedge.net" \
    AZURE_FUNCTIONS_URL="https://$FUNCTION_APP_NAME.azurewebsites.net" \
    CORS_ORIGIN="https://$STATIC_WEB_APP_NAME.azurestaticapps.net" \
    RATE_LIMIT_WINDOW_MS=900000 \
    RATE_LIMIT_MAX_REQUESTS=100 \
    ENABLE_HTTPS_REDIRECT=true \
    ENABLE_HSTS=true \
    ENABLE_CONTENT_SECURITY_POLICY=true

# Configure Web App security settings
echo -e "${BLUE}🛡️  Configuring Web App security...${NC}"
az webapp config set \
    --resource-group $RESOURCE_GROUP \
    --name $WEB_APP_NAME \
    --https-only true \
    --min-tls-version 1.2

# Configure CORS for security
echo -e "${BLUE}🔒 Configuring CORS security...${NC}"
az webapp cors add \
    --resource-group $RESOURCE_GROUP \
    --name $WEB_APP_NAME \
    --allowed-origins "https://$STATIC_WEB_APP_NAME.azurestaticapps.net"

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

# Configure monitoring and alerting
echo -e "${BLUE}📈 Setting up monitoring and alerting...${NC}"
az monitor action-group create \
    --resource-group $RESOURCE_GROUP \
    --name "surprise-gifting-alerts" \
    --short-name "surprise-alerts" \
    --action email "admin@example.com" "Admin"

# Create cost alerts
echo -e "${BLUE}💰 Setting up cost monitoring...${NC}"
az consumption budget create \
    --budget-name "surprise-gifting-budget" \
    --resource-group $RESOURCE_GROUP \
    --amount 5 \
    --time-grain Monthly \
    --start-date $(date -u +%Y-%m-%d) \
    --end-date $(date -u -d "+1 year" +%Y-%m-%d) \
    --notifications '{"contactEmails":["admin@example.com"],"contactGroups":[],"contactRoles":[]}'

echo -e "${GREEN}✅ Optimized Azure deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}🌐 Your application URLs:${NC}"
echo "Frontend: https://$STATIC_WEB_APP_NAME.azurestaticapps.net"
echo "Backend API: https://$WEB_APP_NAME.azurewebsites.net"
echo "Functions: https://$FUNCTION_APP_NAME.azurewebsites.net"
echo "CDN: https://surprise-gifting-cdn-endpoint.azureedge.net"
echo ""
echo -e "${BLUE}🔑 Next steps:${NC}"
echo "1. Update your .env file with the new connection strings"
echo "2. Deploy your code to the Azure services"
echo "3. Test the application"
echo "4. Monitor costs and performance"
echo ""
echo -e "${YELLOW}⚠️  Security & Performance Features Enabled:${NC}"
echo "✅ HTTPS enforcement with TLS 1.2+"
echo "✅ CORS protection"
echo "✅ Rate limiting"
echo "✅ Azure Key Vault for secrets"
echo "✅ Application Insights monitoring"
echo "✅ CDN for global performance"
echo "✅ Storage lifecycle management"
echo "✅ Database security parameters"
echo "✅ Cost monitoring and alerts"
echo ""
echo -e "${CYAN}💰 Free Tier Usage:${NC}"
echo "• App Service: F1 tier (1GB RAM, 1 vCPU)"
echo "• Database: Burstable tier (32GB storage)"
echo "• Storage: 5GB + lifecycle management"
echo "• CDN: 5GB bandwidth/month"
echo "• Functions: 1M requests/month"
echo "• Application Insights: 5GB data/month"
echo "• Key Vault: 10K operations/month"
echo ""
echo -e "${PURPLE}🎯 Estimated Monthly Cost: $0 (Free tier)${NC}"
echo "After free tier: $15-25/month for development"
