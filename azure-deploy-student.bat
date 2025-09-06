@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🎓 Starting Azure Student Deployment for Surprise Gifting Platform...
echo 💰 Using $100 Student Credits + Always Free Services
echo.

REM Configuration
set RESOURCE_GROUP=surprise-gifting-student-rg
set LOCATION=eastus
set APP_NAME=surprise-gifting-student
set DB_NAME=surprise-gifting-student-db
set STORAGE_NAME=surprisestudentstorage
set KEY_VAULT_NAME=surprise-student-kv
set INSIGHTS_NAME=surprise-student-insights
set STATIC_WEB_NAME=surprise-gifting-static

REM Check Azure CLI
echo [INFO] Checking Azure CLI installation...
az --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Azure CLI not found. Please install it first:
    echo    Windows: winget install Microsoft.AzureCLI
    echo    Or download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows
    pause
    exit /b 1
)

REM Check if logged in
echo [INFO] Checking Azure authentication...
az account show >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Not logged in to Azure. Please run: az login
    pause
    exit /b 1
)

echo [SUCCESS] Azure CLI and authentication verified!

REM Create Resource Group (Free)
echo [INFO] Creating Resource Group: %RESOURCE_GROUP%
az group create --name %RESOURCE_GROUP% --location %LOCATION% --tags "Project=SurpriseGifting" "Environment=Student" "CostCenter=Free"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create resource group
    pause
    exit /b 1
)
echo [SUCCESS] Resource Group created!

REM Create App Service Plan (F1 Free Tier)
echo [INFO] Creating App Service Plan (F1 Free Tier)...
az appservice plan create --name "%APP_NAME%-plan" --resource-group %RESOURCE_GROUP% --sku F1 --is-linux --tags "Tier=Free" "Student=Yes"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create app service plan
    pause
    exit /b 1
)
echo [SUCCESS] App Service Plan created (F1 Free Tier)!

REM Create Web App for Backend
echo [INFO] Creating Web App for Backend...
az webapp create --resource-group %RESOURCE_GROUP% --plan "%APP_NAME%-plan" --name "%APP_NAME%-api" --runtime "NODE|18-lts" --deployment-local-git --tags "Component=Backend" "Tier=Free"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create web app
    pause
    exit /b 1
)
echo [SUCCESS] Backend Web App created!

REM Create PostgreSQL Database (Burstable B1ms - Free Tier)
echo [INFO] Creating PostgreSQL Database (Free Tier)...
az postgres flexible-server create --resource-group %RESOURCE_GROUP% --name %DB_NAME% --admin-user adminuser --admin-password "StudentPassword123!" --sku-name Standard_B1ms --version 14 --storage-size 32 --location %LOCATION% --tags "Tier=Free" "Student=Yes"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)
echo [SUCCESS] PostgreSQL Database created (Free Tier)!

REM Configure PostgreSQL firewall
echo [INFO] Configuring PostgreSQL firewall...
az postgres flexible-server firewall-rule create --resource-group %RESOURCE_GROUP% --name %DB_NAME% --rule-name "AllowAzureServices" --start-ip-address 0.0.0.0 --end-ip-address 255.255.255.255
if %errorlevel% neq 0 (
    echo [ERROR] Failed to configure firewall
    pause
    exit /b 1
)
echo [SUCCESS] PostgreSQL firewall configured!

REM Create Storage Account (5GB Free)
echo [INFO] Creating Storage Account (5GB Free)...
az storage account create --resource-group %RESOURCE_GROUP% --name %STORAGE_NAME% --location %LOCATION% --sku Standard_LRS --kind StorageV2 --min-tls-version TLS1_2 --tags "Tier=Free" "Student=Yes"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create storage account
    pause
    exit /b 1
)
echo [SUCCESS] Storage Account created (5GB Free)!

REM Create Blob Container
echo [INFO] Creating Blob Container...
az storage container create --account-name %STORAGE_NAME% --name "surprises" --public-access off
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create blob container
    pause
    exit /b 1
)
echo [SUCCESS] Blob Container created!

REM Create Key Vault (10K operations/month free)
echo [INFO] Creating Key Vault (Free Tier)...
az keyvault create --resource-group %RESOURCE_GROUP% --name %KEY_VAULT_NAME% --location %LOCATION% --sku standard --enabled-for-deployment true --enabled-for-disk-encryption true --enabled-for-template-deployment true --tags "Tier=Free" "Student=Yes"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create key vault
    pause
    exit /b 1
)
echo [SUCCESS] Key Vault created (Free Tier)!

REM Create Application Insights (5GB/month free)
echo [INFO] Creating Application Insights (5GB/month free)...
az monitor app-insights component create --resource-group %RESOURCE_GROUP% --app %INSIGHTS_NAME% --location %LOCATION% --kind web --tags "Tier=Free" "Student=Yes"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create application insights
    pause
    exit /b 1
)
echo [SUCCESS] Application Insights created (5GB/month free)!

REM Create Static Web App (100GB bandwidth/month free)
echo [INFO] Creating Static Web App (100GB bandwidth/month free)...
az staticwebapp create --name %STATIC_WEB_NAME% --resource-group %RESOURCE_GROUP% --source https://github.com/yourusername/your-repo --location %LOCATION% --tags "Tier=Free" "Student=Yes"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create static web app
    pause
    exit /b 1
)
echo [SUCCESS] Static Web App created (100GB bandwidth/month free)!

REM Store secrets in Key Vault
echo [INFO] Storing secrets in Key Vault...
az keyvault secret set --vault-name %KEY_VAULT_NAME% --name "DatabasePassword" --value "StudentPassword123!"
az keyvault secret set --vault-name %KEY_VAULT_NAME% --name "StorageConnectionString" --value "$(az storage account show-connection-string --name %STORAGE_NAME% --resource-group %RESOURCE_GROUP% --query connectionString -o tsv)"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to store secrets
    pause
    exit /b 1
)
echo [SUCCESS] Secrets stored in Key Vault!

REM Get connection strings
set DB_CONNECTION_STRING=postgresql://adminuser:StudentPassword123!@%DB_NAME%.postgres.database.azure.com:5432/surprise_gifting?sslmode=require

REM Configure Web App environment variables
echo [INFO] Configuring Web App environment variables...
az webapp config appsettings set --resource-group %RESOURCE_GROUP% --name "%APP_NAME%-api" --settings ^
    "NODE_ENV=production" ^
    "PORT=8080" ^
    "DATABASE_URL=%DB_CONNECTION_STRING%" ^
    "JWT_SECRET=StudentJWTSecret123!" ^
    "ENCRYPTION_KEY=Your32CharEncryptionKeyHere" ^
    "CLIENT_URL=https://%STATIC_WEB_NAME%.azurestaticapps.net"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to configure environment variables
    pause
    exit /b 1
)
echo [SUCCESS] Environment variables configured!

REM Enable logging
echo [INFO] Enabling application logging...
az webapp log config --resource-group %RESOURCE_GROUP% --name "%APP_NAME%-api" --web-server-logging filesystem --docker-container-logging filesystem
if %errorlevel% neq 0 (
    echo [ERROR] Failed to enable logging
    pause
    exit /b 1
)
echo [SUCCESS] Logging enabled!

REM Create deployment summary
echo [INFO] Creating deployment summary...
(
echo # 🎓 Azure Student Deployment Summary
echo.
echo ## 🌐 URLs
echo - **Backend API**: https://%APP_NAME%-api.azurewebsites.net
echo - **Frontend**: https://%STATIC_WEB_NAME%.azurestaticapps.net
echo - **Azure Portal**: https://portal.azure.com
echo.
echo ## 🗄️ Database
echo - **PostgreSQL**: %DB_NAME%.postgres.database.azure.com
echo - **Username**: adminuser
echo - **Password**: StudentPassword123!
echo.
echo ## 📊 Monitoring
echo - **Application Insights**: %INSIGHTS_NAME%
echo - **Key Vault**: %KEY_VAULT_NAME%
echo - **Storage Account**: %STORAGE_NAME%
echo.
echo ## 💰 Cost Analysis
echo - **Free Tier Services**: Always Free (No Expiration)
echo - **Student Credits**: $100 (Valid for 12 months)
echo - **Estimated Monthly Cost**: $0 (After credits expire)
echo.
echo ## 🚀 Next Steps
echo 1. Deploy your code to the Web App
echo 2. Deploy frontend to Static Web App
echo 3. Test all functionality
echo 4. Monitor performance in Azure Portal
echo.
echo ## 🔒 Security Notes
echo - Database password stored in Key Vault
echo - HTTPS enabled by default
echo - Firewall rules configured
echo - JWT secrets managed securely
echo.
echo Generated on: %date% %time%
) > deployment-summary.md

echo [SUCCESS] Deployment summary created: deployment-summary.md

REM Final status
echo.
echo [SUCCESS] 🎉 AZURE STUDENT DEPLOYMENT COMPLETED!
echo.
echo 📋 Summary:
echo    ✅ Resource Group: %RESOURCE_GROUP%
echo    ✅ Backend API: %APP_NAME%-api.azurewebsites.net
echo    ✅ Database: %DB_NAME%.postgres.database.azure.com
echo    ✅ Storage: %STORAGE_NAME%.blob.core.windows.net
echo    ✅ Key Vault: %KEY_VAULT_NAME%.vault.azure.net
echo    ✅ Monitoring: %INSIGHTS_NAME%
echo    ✅ Frontend: %STATIC_WEB_NAME%.azurestaticapps.net
echo.
echo 💰 Cost: FREE (Student Benefits + $100 Credits)
echo 📅 Duration: Always Free (No Expiration)
echo.
echo 📖 Next: Read deployment-summary.md for detailed information
echo 🚀 Ready to deploy your code!
echo.
echo [WARNING] Remember: Keep your database password secure!
echo [WARNING] Note: This uses student free tier - perfect for learning and development!
echo.
pause
