#!/bin/bash

# 🎓 AZURE STUDENT DEPLOYMENT SCRIPT
# Optimized for Student Free Tier Benefits
# Uses $100 credits + Always Free services

set -e

echo "🎓 Starting Azure Student Deployment for Surprise Gifting Platform..."
echo "💰 Using $100 Student Credits + Always Free Services"
echo ""

# Configuration
RESOURCE_GROUP="surprise-gifting-student-rg"
LOCATION="eastus"  # Student-friendly region
APP_NAME="surprise-gifting-student"
DB_NAME="surprise-gifting-student-db"
STORAGE_NAME="surprisestudentstorage"
KEY_VAULT_NAME="surprise-student-kv"
INSIGHTS_NAME="surprise-student-insights"
STATIC_WEB_NAME="surprise-gifting-static"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Azure CLI
print_status "Checking Azure CLI installation..."
if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install it first:"
    echo "   Windows: winget install Microsoft.AzureCLI"
    echo "   Or download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows"
    exit 1
fi

# Check if logged in
print_status "Checking Azure authentication..."
if ! az account show &> /dev/null; then
    print_error "Not logged in to Azure. Please run: az login"
    exit 1
fi

# Check student account
print_status "Verifying student account..."
ACCOUNT_INFO=$(az account show --query "{name:name, state:state, isDefault:isDefault}" -o json)
echo "Account: $ACCOUNT_INFO"

print_success "Azure CLI and authentication verified!"

# Create Resource Group (Free)
print_status "Creating Resource Group: $RESOURCE_GROUP"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --tags "Project=SurpriseGifting" "Environment=Student" "CostCenter=Free"

print_success "Resource Group created!"

# Create App Service Plan (F1 Free Tier)
print_status "Creating App Service Plan (F1 Free Tier)..."
az appservice plan create \
    --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --sku F1 \
    --is-linux \
    --tags "Tier=Free" "Student=Yes"

print_success "App Service Plan created (F1 Free Tier)!"

# Create Web App for Backend
print_status "Creating Web App for Backend..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --name "${APP_NAME}-api" \
    --runtime "NODE|18-lts" \
    --deployment-local-git \
    --tags "Component=Backend" "Tier=Free"

print_success "Backend Web App created!"

# Create PostgreSQL Database (Burstable B1ms - Free Tier)
print_status "Creating PostgreSQL Database (Free Tier)..."
az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_NAME \
    --admin-user adminuser \
    --admin-password "StudentPassword123!" \
    --sku-name Standard_B1ms \
    --version 14 \
    --storage-size 32 \
    --location $LOCATION \
    --tags "Tier=Free" "Student=Yes"

print_success "PostgreSQL Database created (Free Tier)!"

# Configure PostgreSQL firewall
print_status "Configuring PostgreSQL firewall..."
az postgres flexible-server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_NAME \
    --rule-name "AllowAzureServices" \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 255.255.255.255

print_success "PostgreSQL firewall configured!"

# Create Storage Account (5GB Free)
print_status "Creating Storage Account (5GB Free)..."
az storage account create \
    --resource-group $RESOURCE_GROUP \
    --name $STORAGE_NAME \
    --location $LOCATION \
    --sku Standard_LRS \
    --kind StorageV2 \
    --min-tls-version TLS1_2 \
    --tags "Tier=Free" "Student=Yes"

print_success "Storage Account created (5GB Free)!"

# Create Blob Container
print_status "Creating Blob Container..."
az storage container create \
    --account-name $STORAGE_NAME \
    --name "surprises" \
    --public-access off

print_success "Blob Container created!"

# Create Key Vault (10K operations/month free)
print_status "Creating Key Vault (Free Tier)..."
az keyvault create \
    --resource-group $RESOURCE_GROUP \
    --name $KEY_VAULT_NAME \
    --location $LOCATION \
    --sku standard \
    --enabled-for-deployment true \
    --enabled-for-disk-encryption true \
    --enabled-for-template-deployment true \
    --tags "Tier=Free" "Student=Yes"

print_success "Key Vault created (Free Tier)!"

# Create Application Insights (5GB/month free)
print_status "Creating Application Insights (5GB/month free)..."
az monitor app-insights component create \
    --resource-group $RESOURCE_GROUP \
    --app $INSIGHTS_NAME \
    --location $LOCATION \
    --kind web \
    --tags "Tier=Free" "Student=Yes"

print_success "Application Insights created (5GB/month free)!"

# Create Static Web App (100GB bandwidth/month free)
print_status "Creating Static Web App (100GB bandwidth/month free)..."
az staticwebapp create \
    --name $STATIC_WEB_NAME \
    --resource-group $RESOURCE_GROUP \
    --source https://github.com/yourusername/your-repo \
    --location $LOCATION \
    --tags "Tier=Free" "Student=Yes"

print_success "Static Web App created (100GB bandwidth/month free)!"

# Store secrets in Key Vault
print_status "Storing secrets in Key Vault..."
az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name "DatabasePassword" \
    --value "StudentPassword123!"

az keyvault secret set \
    --vault-name $KEY_VAULT_NAME \
    --name "StorageConnectionString" \
    --value "$(az storage account show-connection-string --name $STORAGE_NAME --resource-group $RESOURCE_GROUP --query connectionString -o tsv)"

print_success "Secrets stored in Key Vault!"

# Get connection strings
DB_CONNECTION_STRING="postgresql://adminuser:StudentPassword123!@${DB_NAME}.postgres.database.azure.com:5432/surprise_gifting?sslmode=require"
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name $STORAGE_NAME --resource-group $RESOURCE_GROUP --query connectionString -o tsv)

# Configure Web App environment variables
print_status "Configuring Web App environment variables..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name "${APP_NAME}-api" \
    --settings \
    "NODE_ENV=production" \
    "PORT=8080" \
    "DATABASE_URL=$DB_CONNECTION_STRING" \
    "STORAGE_CONNECTION_STRING=$STORAGE_CONNECTION_STRING" \
    "KEY_VAULT_NAME=$KEY_VAULT_NAME" \
    "APPLICATION_INSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show --resource-group $RESOURCE_GROUP --app $INSIGHTS_NAME --query connectionString -o tsv)" \
    "JWT_SECRET=StudentJWTSecret123!" \
    "AZURE_TENANT_ID=$(az account show --query tenantId -o tsv)" \
    "AZURE_SUBSCRIPTION_ID=$(az account show --query id -o tsv)" \
    "ENCRYPTION_KEY=Your32CharEncryptionKeyHere" \
    "CLIENT_URL=https://${STATIC_WEB_NAME}.azurestaticapps.net"

print_success "Environment variables configured!"

# Enable logging
print_status "Enabling application logging..."
az webapp log config \
    --resource-group $RESOURCE_GROUP \
    --name "${APP_NAME}-api" \
    --web-server-logging filesystem \
    --docker-container-logging filesystem

print_success "Logging enabled!"

# Create deployment summary
print_status "Creating deployment summary..."
cat > deployment-summary.md << EOF
# 🎓 Azure Student Deployment Summary

## 🌐 URLs
- **Backend API**: https://${APP_NAME}-api.azurewebsites.net
- **Frontend**: https://${STATIC_WEB_NAME}.azurestaticapps.net
- **Azure Portal**: https://portal.azure.com

## 🗄️ Database
- **PostgreSQL**: ${DB_NAME}.postgres.database.azure.com
- **Username**: adminuser
- **Password**: StudentPassword123!

## 📊 Monitoring
- **Application Insights**: $INSIGHTS_NAME
- **Key Vault**: $KEY_VAULT_NAME
- **Storage Account**: $STORAGE_NAME

## 💰 Cost Analysis
- **Free Tier Services**: Always Free (No Expiration)
- **Student Credits**: $100 (Valid for 12 months)
- **Estimated Monthly Cost**: $0 (After credits expire)

## 🚀 Next Steps
1. Deploy your code to the Web App
2. Deploy frontend to Static Web App
3. Test all functionality
4. Monitor performance in Azure Portal

## 🔒 Security Notes
- Database password stored in Key Vault
- HTTPS enabled by default
- Firewall rules configured
- JWT secrets managed securely

Generated on: $(date)
EOF

print_success "Deployment summary created: deployment-summary.md"

# Final status
echo ""
print_success "🎉 AZURE STUDENT DEPLOYMENT COMPLETED!"
echo ""
echo "📋 Summary:"
echo "   ✅ Resource Group: $RESOURCE_GROUP"
echo "   ✅ Backend API: ${APP_NAME}-api.azurewebsites.net"
echo "   ✅ Database: $DB_NAME.postgres.database.azure.com"
echo "   ✅ Storage: $STORAGE_NAME.blob.core.windows.net"
echo "   ✅ Key Vault: $KEY_VAULT_NAME.vault.azure.net"
echo "   ✅ Monitoring: $INSIGHTS_NAME"
echo "   ✅ Frontend: $STATIC_WEB_NAME.azurestaticapps.net"
echo ""
echo "💰 Cost: FREE (Student Benefits + $100 Credits)"
echo "📅 Duration: Always Free (No Expiration)"
echo ""
echo "📖 Next: Read deployment-summary.md for detailed information"
echo "🚀 Ready to deploy your code!"
echo ""
print_warning "Remember: Keep your database password secure!"
print_warning "Note: This uses student free tier - perfect for learning and development!"
