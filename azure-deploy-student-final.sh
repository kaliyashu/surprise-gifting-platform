#!/bin/bash

# 🎓 AZURE STUDENT DEPLOYMENT SCRIPT (FINAL)
# Optimized for Student Free Tier Benefits
set -e

RESOURCE_GROUP="surprise-gifting-student-rg"
LOCATION="eastus"
APP_NAME="surprise-gifting-student"
DB_NAME="surprise-gifting-student-db"
STORAGE_NAME="surprisestudentstorage"
KEY_VAULT_NAME="surprise-student-kv"
INSIGHTS_NAME="surprise-student-insights"
STATIC_WEB_NAME="surprise-gifting-static"

# ...existing resource creation steps...

# Configure Web App environment variables (UPDATED)
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

# ...rest of script unchanged...
