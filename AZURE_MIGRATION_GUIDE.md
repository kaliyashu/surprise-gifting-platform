# 🚀 Azure Migration Guide for Surprise Gifting Platform

This guide will help you migrate your Surprise Gifting Platform from local development to Microsoft Azure cloud services, taking advantage of student benefits and free tier services.

## 📋 **Prerequisites**

### **Azure Student Account Setup**
1. **Sign up for Azure for Students** at [azure.microsoft.com/free/students](https://azure.microsoft.com/free/students)
2. **Verify your student email** (.edu domain)
3. **Get $100 Azure credit** + free services for 12 months
4. **Install Azure CLI** from [docs.microsoft.com/cli/azure/install-azure-cli](https://docs.microsoft.com/cli/azure/install-azure-cli)

### **Required Tools**
- Azure CLI
- Git
- Node.js 18+
- PostgreSQL client (optional)

## 🎯 **Azure Services We'll Use**

### **Free Tier (12 months)**
| Service | Purpose | Free Tier Limits |
|---------|---------|------------------|
| **Azure App Service** | Host backend API | 1 F1 instance, 1GB RAM |
| **Azure Database for PostgreSQL** | Database | 32GB storage, 4 vCores |
| **Azure Blob Storage** | File storage | 5GB storage, 20,000 read/write operations |
| **Azure Key Vault** | Secrets management | 10,000 operations/month |
| **Azure Application Insights** | Monitoring | 5GB data/month |

### **Always Free**
| Service | Purpose | Free Tier Limits |
|---------|---------|------------------|
| **Azure Static Web Apps** | Host frontend | 2GB storage, 100GB bandwidth |
| **Azure Functions** | Serverless API | 1M requests/month, 400,000 GB-seconds |
| **Azure CDN** | Content delivery | 5GB bandwidth/month |

## 🔧 **Step-by-Step Migration**

### **Step 1: Azure Infrastructure Setup**

Run the deployment script to create all Azure resources:

```bash
# Make script executable
chmod +x azure-deploy.sh

# Run the deployment script
./azure-deploy.sh
```

**What this creates:**
- Resource Group: `surprise-gifting-rg`
- App Service Plan: `surprise-gifting-plan` (Free F1 tier)
- Web App: `surprise-gifting-app` (Backend API)
- Static Web App: `surprise-gifting-static` (Frontend)
- PostgreSQL Database: `surprise-gifting-db`
- Storage Account: `surprisegiftingstorage`
- Key Vault: `surprise-gifting-kv`
- Application Insights: `surprise-gifting-insights`

### **Step 2: Update Environment Configuration**

1. **Copy the Azure environment file:**
   ```bash
   cp azure.env .env
   ```

2. **Update the `.env` file with your actual Azure values:**
   - Replace `YOUR_STORAGE_KEY` with actual storage account key
   - Replace `YOUR_TENANT_ID`, `YOUR_CLIENT_ID`, etc. with your Azure AD values
   - Update passwords and secrets

3. **Get Azure service credentials:**
   ```bash
   # Get storage account key
   az storage account keys list --name surprisegiftingstorage --resource-group surprise-gifting-rg

   # Get PostgreSQL connection string
   az postgres flexible-server show-connection-string --name surprise-gifting-db --admin-user postgres --admin-password "YourPassword" --database-name surprise_moments

   # Get App Insights connection string
   az monitor app-insights component show --app surprise-gifting-insights --resource-group surprise-gifting-rg --query "ConnectionString"
   ```

### **Step 3: Database Migration**

1. **Update database configuration:**
```javascript
   // In server/config/database.js, change the import to:
   const { query, getClient, pool } = require('./azure-database');
   ```

2. **Run database setup:**
   ```bash
   cd server
   npm run db:setup
   ```

3. **Verify connection:**
   ```bash
   # Test database connection
   node -e "require('./config/azure-database').healthCheck().then(console.log)"
   ```

### **Step 4: Backend Deployment**

1. **Deploy to Azure App Service:**
```bash
   # Navigate to server directory
   cd server

   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial Azure deployment"

   # Add Azure remote
   az webapp deployment source config-local-git --name surprise-gifting-app --resource-group surprise-gifting-rg

   # Get git URL and push
   GIT_URL=$(az webapp deployment source config-local-git --name surprise-gifting-app --resource-group surprise-gifting-rg --query url -o tsv)
   git remote add azure $GIT_URL
   git push azure master
   ```

2. **Verify deployment:**
```bash
   # Check app status
   az webapp show --name surprise-gifting-app --resource-group surprise-gifting-rg

   # View logs
   az webapp log tail --name surprise-gifting-app --resource-group surprise-gifting-rg
   ```

### **Step 5: Frontend Deployment**

1. **Build the frontend:**
```bash
   cd client
   npm run build
   ```

2. **Deploy to Azure Static Web Apps:**
```bash
   # The deployment script already set up continuous deployment
   # Just push to your GitHub repository
   git add .
   git commit -m "Update for Azure deployment"
   git push origin main
   ```

3. **Verify deployment:**
   - Check your Static Web App URL: `https://surprise-gifting-static.azurestaticapps.net`
   - Verify API calls work: `https://surprise-gifting-static.azurestaticapps.net/api/health`

### **Step 6: Storage Configuration**

1. **Update Azure Storage settings:**
   ```bash
   # Create containers
   az storage container create --name uploads --account-name surprisegiftingstorage --public-access blob
   az storage container create --name assets --account-name surprisegiftingstorage --public-access blob
   ```

2. **Verify storage integration:**
   - Test file upload through your application
   - Check files appear in Azure Storage Explorer

### **Step 7: Authentication Setup (Optional)**

1. **Set up Azure AD B2C:**
```bash
   # Create B2C tenant
   az ad b2c tenant create --location "United States" --display-name "Surprise Gifting B2C" --country-code "US"
   ```

2. **Configure authentication in your app:**
   - Update frontend to use Azure AD B2C
   - Configure backend to validate B2C tokens

## 🧪 **Testing Your Migration**

### **Health Checks**
```bash
# Backend health
curl https://surprise-gifting-app.azurewebsites.net/api/health

# Frontend health
curl https://surprise-gifting-static.azurestaticapps.net/api/health

# Database health
curl https://surprise-gifting-app.azurewebsites.net/api/health
```

### **Functional Tests**
1. **User Registration/Login**
2. **File Upload/Download**
3. **Surprise Creation**
4. **Database Operations**
5. **API Endpoints**

## 📊 **Monitoring & Analytics**

### **Application Insights**
- **Performance monitoring** for your API
- **Error tracking** and alerting
- **Usage analytics** and user behavior
- **Real-time monitoring** dashboard

### **Azure Monitor**
- **Resource utilization** tracking
- **Cost monitoring** and alerts
- **Service health** status

## 💰 **Cost Optimization**

### **Free Tier Maximization**
- **App Service**: Use F1 tier (free) for development
- **Database**: Burstable tier with auto-pause
- **Storage**: Optimize blob lifecycle policies
- **Functions**: Use consumption plan for low traffic

### **Scaling Strategy**
- Start with free tiers
- Monitor usage and costs
- Scale up gradually as needed
- Use auto-scaling rules

## 🔒 **Security Best Practices**

### **Secrets Management**
- Store all secrets in Azure Key Vault
- Use managed identities when possible
- Rotate secrets regularly
- Monitor access to secrets

### **Network Security**
- Enable Azure Firewall rules
- Use private endpoints for databases
- Implement proper CORS policies
- Enable HTTPS everywhere

### **Authentication**
- Use Azure AD B2C for user management
- Implement proper JWT validation
- Use role-based access control (RBAC)
- Enable multi-factor authentication

## 🚨 **Troubleshooting Common Issues**

### **Database Connection Issues**
```bash
# Check firewall rules
az postgres flexible-server firewall-rule list --name surprise-gifting-db --resource-group surprise-gifting-rg

# Add your IP to firewall
az postgres flexible-server firewall-rule create --name allow-my-ip --start-ip-address YOUR_IP --end-ip-address YOUR_IP --name surprise-gifting-db --resource-group surprise-gifting-rg
```

### **Storage Access Issues**
```bash
# Check storage account keys
az storage account keys list --name surprisegiftingstorage --resource-group surprise-gifting-rg

# Verify container access
az storage container list --account-name surprisegiftingstorage
```

### **App Service Issues**
```bash
# Check app logs
az webapp log tail --name surprise-gifting-app --resource-group surprise-gifting-rg

# Restart app
az webapp restart --name surprise-gifting-app --resource-group surprise-gifting-rg
```

## 📈 **Performance Optimization**

### **Database Optimization**
- Use connection pooling
- Implement query optimization
- Enable read replicas for scaling
- Use Azure Database Advisor

### **Storage Optimization**
- Implement CDN for static assets
- Use blob lifecycle policies
- Optimize file sizes and formats
- Enable compression

### **API Optimization**
- Implement caching strategies
- Use Azure Functions for heavy operations
- Optimize database queries
- Enable compression middleware

## 🔄 **Continuous Deployment**

### **GitHub Actions Setup**
```yaml
# .github/workflows/azure-deploy.yml
name: Deploy to Azure
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Azure
      uses: azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/client"
        api_location: "/server"
        output_location: "build"
```

## 📚 **Additional Resources**

### **Azure Documentation**
- [Azure for Students](https://azure.microsoft.com/free/students/)
- [Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/)
- [App Service](https://docs.microsoft.com/azure/app-service/)
- [PostgreSQL on Azure](https://docs.microsoft.com/azure/postgresql/)

### **Community Support**
- [Azure Community](https://techcommunity.microsoft.com/t5/azure/ct-p/Azure)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/azure)
- [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure.html)

## 🎉 **Congratulations!**

You've successfully migrated your Surprise Gifting Platform to Azure! Your application now benefits from:

- **Scalable cloud infrastructure**
- **Professional-grade security**
- **Built-in monitoring and analytics**
- **Cost-effective hosting**
- **Global CDN distribution**
- **Automatic backups and disaster recovery**

### **Next Steps**
1. **Monitor performance** and costs
2. **Set up alerts** for critical issues
3. **Implement CI/CD** pipeline
4. **Add custom domain** (optional)
5. **Scale resources** as needed
6. **Explore additional Azure services**

---

**Need Help?** Check the troubleshooting section above or reach out to the Azure community for support!

