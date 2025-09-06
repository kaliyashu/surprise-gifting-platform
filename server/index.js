const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import asset manager
const assetManager = require('./utils/assetManager');

// Import Azure services
const azureAppInsights = require('./utils/azureAppInsights');
const azureKeyVault = require('./utils/azureKeyVault');

const createAuthRouter = require('./routes/auth');
// ...existing code...
app.use('/api/auth', createAuthRouter());
const templateRoutes = require('./routes/templates');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.surprisemoments.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    assets: assetManager.getStats()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/surprises', surpriseRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/assets', require('./routes/assets'));

// Protected routes
app.use('/api/creator', authenticateToken, require('./routes/creator'));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Initialize Azure services and start server
async function startServer() {
  try {
    // Initialize Azure Application Insights
    if (process.env.AZURE_APP_INSIGHTS_CONNECTION_STRING) {
      azureAppInsights.initialize();
      console.log('✅ Azure Application Insights initialized');
    }

    // Initialize Azure Key Vault (development only)
    if (process.env.NODE_ENV === 'development' && process.env.AZURE_KEY_VAULT_NAME) {
      await azureKeyVault.backupSecretsToEnv();
      console.log('✅ Azure Key Vault secrets loaded to environment');
    }

    // Initialize asset manager
    await assetManager.initialize();
    
    app.listen(PORT, () => {
      console.log(`🚀 Surprise Moments Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📁 Assets loaded: ${JSON.stringify(assetManager.getStats())}`);
      
      // Track server startup
      if (azureAppInsights.isInitialized) {
        azureAppInsights.trackEvent('ServerStarted', {
          port: PORT,
          environment: process.env.NODE_ENV || 'development'
        });
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    // Track startup error
    if (azureAppInsights.isInitialized) {
      azureAppInsights.trackException(error, {
        context: 'ServerStartup',
        port: PORT
      });
    }
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
