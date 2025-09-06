const { app } = require('@azure/functions');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import your existing routes
const authRoutes = require('../../../server/routes/auth');
const surpriseRoutes = require('../../../server/routes/surprises');
const mediaRoutes = require('../../../server/routes/media');
const templateRoutes = require('../../../server/routes/templates');
const { errorHandler } = require('../../../server/middleware/errorHandler');
const { authenticateToken } = require('../../../server/middleware/auth');

// Create Express app
const expressApp = express();

// Security middleware
expressApp.use(helmet({
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
expressApp.use('/api/', limiter);

// Body parsing middleware
expressApp.use(compression());
expressApp.use(cors({
  origin: process.env.CLIENT_URL || 'https://surprise-gifting-static.azurestaticapps.net',
  credentials: true
}));
expressApp.use(express.json({ limit: '50mb' }));
expressApp.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
expressApp.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'Azure Functions'
  });
});

// API Routes
expressApp.use('/api/auth', authRoutes);
expressApp.use('/api/surprises', surpriseRoutes);
expressApp.use('/api/media', mediaRoutes);
expressApp.use('/api/templates', templateRoutes);
expressApp.use('/api/assets', require('../../../server/routes/assets'));

// Protected routes
expressApp.use('/api/creator', authenticateToken, require('../../../server/routes/creator'));

// Error handling middleware
expressApp.use(errorHandler);

// 404 handler
expressApp.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Azure Functions handler
app.http('api', {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    // Convert Azure Functions request to Express request
    const expressRequest = {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      query: request.query,
      params: request.params,
      originalUrl: request.url
    };

    const expressResponse = {
      statusCode: 200,
      headers: {},
      body: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = JSON.stringify(data);
        this.headers['Content-Type'] = 'application/json';
        return this;
      },
      send: function(data) {
        this.body = data;
        return this;
      },
      set: function(name, value) {
        this.headers[name] = value;
        return this;
      }
    };

    // Handle the request through Express
    try {
      await new Promise((resolve, reject) => {
        expressApp(expressRequest, expressResponse, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return {
        status: expressResponse.statusCode,
        headers: expressResponse.headers,
        body: expressResponse.body
      };
    } catch (error) {
      context.error('Error processing request:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
});
