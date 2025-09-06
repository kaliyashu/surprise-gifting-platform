const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

class AzureKeyVaultService {
  constructor() {
    this.vaultName = process.env.AZURE_KEY_VAULT_NAME;
    this.vaultUrl = `https://${this.vaultName}.vault.azure.net`;
    
    // Use managed identity in production, service principal in development
    this.credential = new DefaultAzureCredential();
    this.client = new SecretClient(this.vaultUrl, this.credential);
  }

  /**
   * Get a secret from Azure Key Vault
   * @param {string} secretName - Name of the secret
   * @returns {Promise<string>} - Secret value
   */
  async getSecret(secretName) {
    try {
      const secret = await this.client.getSecret(secretName);
      return secret.value;
    } catch (error) {
      console.error(`Failed to get secret ${secretName}:`, error);
      throw new Error(`Secret ${secretName} not found or access denied`);
    }
  }

  /**
   * Set a secret in Azure Key Vault
   * @param {string} secretName - Name of the secret
   * @param {string} secretValue - Value of the secret
   * @returns {Promise<Object>} - Secret properties
   */
  async setSecret(secretName, secretValue) {
    try {
      const secret = await this.client.setSecret(secretName, secretValue);
      return secret;
    } catch (error) {
      console.error(`Failed to set secret ${secretName}:`, error);
      throw new Error(`Failed to set secret ${secretName}`);
    }
  }

  /**
   * Delete a secret from Azure Key Vault
   * @param {string} secretName - Name of the secret
   * @returns {Promise<Object>} - Deleted secret properties
   */
  async deleteSecret(secretName) {
    try {
      const poller = await this.client.beginDeleteSecret(secretName);
      const deletedSecret = await poller.pollUntilDone();
      return deletedSecret;
    } catch (error) {
      console.error(`Failed to delete secret ${secretName}:`, error);
      throw new Error(`Failed to delete secret ${secretName}`);
    }
  }

  /**
   * List all secrets in the vault
   * @returns {Promise<Array>} - List of secret names
   */
  async listSecrets() {
    try {
      const secrets = [];
      for await (const secret of this.client.listPropertiesOfSecrets()) {
        secrets.push({
          name: secret.name,
          enabled: secret.enabled,
          createdOn: secret.createdOn,
          updatedOn: secret.updatedOn
        });
      }
      return secrets;
    } catch (error) {
      console.error('Failed to list secrets:', error);
      return [];
    }
  }

  /**
   * Get database connection string from Key Vault
   * @returns {Promise<string>} - Database connection string
   */
  async getDatabaseConnectionString() {
    return await this.getSecret('database-connection-string');
  }

  /**
   * Get JWT secret from Key Vault
   * @returns {Promise<string>} - JWT secret
   */
  async getJwtSecret() {
    return await this.getSecret('jwt-secret');
  }

  /**
   * Get Azure Storage connection string from Key Vault
   * @returns {Promise<string>} - Storage connection string
   */
  async getStorageConnectionString() {
    return await this.getSecret('azure-storage-connection-string');
  }

  /**
   * Get Application Insights connection string from Key Vault
   * @returns {Promise<string>} - App Insights connection string
   */
  async getAppInsightsConnectionString() {
    return await this.getSecret('app-insights-connection-string');
  }

  /**
   * Get email service credentials from Key Vault
   * @returns {Promise<Object>} - Email credentials
   */
  async getEmailCredentials() {
    try {
      const emailHost = await this.getSecret('email-host');
      const emailUser = await this.getSecret('email-user');
      const emailPassword = await this.getSecret('email-password');
      
      return {
        host: emailHost,
        user: emailUser,
        password: emailPassword
      };
    } catch (error) {
      console.error('Failed to get email credentials:', error);
      return null;
    }
  }

  /**
   * Get social media API keys from Key Vault
   * @returns {Promise<Object>} - Social media API keys
   */
  async getSocialMediaKeys() {
    try {
      const googleClientId = await this.getSecret('google-client-id');
      const googleClientSecret = await this.getSecret('google-client-secret');
      const facebookAppId = await this.getSecret('facebook-app-id');
      const facebookAppSecret = await this.getSecret('facebook-app-secret');
      
      return {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret
        },
        facebook: {
          appId: facebookAppId,
          appSecret: facebookAppSecret
        }
      };
    } catch (error) {
      console.error('Failed to get social media keys:', error);
      return {};
    }
  }

  /**
   * Initialize required secrets if they don't exist
   * @returns {Promise<void>}
   */
  async initializeSecrets() {
    const requiredSecrets = [
      'database-connection-string',
      'jwt-secret',
      'azure-storage-connection-string',
      'app-insights-connection-string'
    ];

    for (const secretName of requiredSecrets) {
      try {
        await this.getSecret(secretName);
        console.log(`✅ Secret ${secretName} exists`);
      } catch (error) {
        console.warn(`⚠️ Secret ${secretName} not found. Please set it in Azure Key Vault.`);
      }
    }
  }

  /**
   * Backup secrets to local environment (development only)
   * @returns {Promise<void>}
   */
  async backupSecretsToEnv() {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Secret backup is disabled in production');
      return;
    }

    try {
      const secrets = await this.listSecrets();
      
      for (const secret of secrets) {
        if (secret.enabled) {
          try {
            const value = await this.getSecret(secret.name);
            process.env[secret.name.toUpperCase().replace(/-/g, '_')] = value;
            console.log(`✅ Loaded secret ${secret.name} to environment`);
          } catch (error) {
            console.warn(`⚠️ Failed to load secret ${secret.name}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to backup secrets:', error);
    }
  }
}

module.exports = new AzureKeyVaultService();

