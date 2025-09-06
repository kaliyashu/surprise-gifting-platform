const { Pool } = require('pg');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
require('dotenv').config();

class AzureDatabaseService {
  constructor() {
    this.pool = null;
    this.credential = null;
    this.secretClient = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize Azure credentials
      this.credential = new DefaultAzureCredential();
      
      // Initialize Key Vault client
      if (process.env.AZURE_KEY_VAULT_NAME) {
        const keyVaultUrl = `https://${process.env.AZURE_KEY_VAULT_NAME}.vault.azure.net`;
        this.secretClient = new SecretClient(keyVaultUrl, this.credential);
      }

      // Get database credentials from environment or Key Vault
      const dbConfig = await this.getDatabaseConfig();
      
      // Create connection pool
      this.pool = new Pool({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password,
        ssl: {
          rejectUnauthorized: false,
          ca: process.env.DB_SSL_CA || undefined
        },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        // Azure PostgreSQL specific settings
        application_name: 'surprise-gifting-platform',
        statement_timeout: 30000,
        query_timeout: 30000
      });

      // Test the connection
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('✅ Azure PostgreSQL database connection established');
      
    } catch (error) {
      console.error('❌ Failed to initialize Azure database connection:', error);
      throw error;
    }
  }

  async getDatabaseConfig() {
    try {
      let dbConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      };

      // If using Key Vault, try to get secrets from there
      if (this.secretClient) {
        try {
          const connectionStringSecret = await this.secretClient.getSecret('PostgreSQLConnectionString');
          if (connectionStringSecret.value) {
            // Parse connection string
            const connectionString = connectionStringSecret.value;
            const url = new URL(connectionString.replace('postgresql://', 'https://'));
            
            dbConfig = {
              host: url.hostname,
              port: url.port || 5432,
              database: url.pathname.slice(1), // Remove leading slash
              user: url.username,
              password: url.password
            };
          }
        } catch (keyVaultError) {
          console.warn('⚠️ Could not retrieve database config from Key Vault, using environment variables');
        }
      }

      // Validate required fields
      const requiredFields = ['host', 'database', 'user', 'password'];
      for (const field of requiredFields) {
        if (!dbConfig[field]) {
          throw new Error(`Missing required database configuration: ${field}`);
        }
      }

      return dbConfig;
    } catch (error) {
      console.error('❌ Error getting database configuration:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connection test successful');
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  async query(text, params) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.pool.query(text, params);
  }

  async getClient() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.pool.connect();
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connection pool closed');
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as health_check');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      };
    }
  }

  // Get connection pool statistics
  getPoolStats() {
    if (!this.pool) return null;
    
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}

// Create singleton instance
const azureDatabaseService = new AzureDatabaseService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down database connections...');
  await azureDatabaseService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down database connections...');
  await azureDatabaseService.close();
  process.exit(0);
});

module.exports = azureDatabaseService;
