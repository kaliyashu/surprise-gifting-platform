const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

/**
 * Enhanced security middleware configuration
 */
const securityMiddleware = {
  /**
   * Configure Helmet security headers
   */
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        fontSrc: [
          "'self'", 
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net"
        ],
        imgSrc: [
          "'self'", 
          "data:", 
          "https:",
          "blob:"
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net"
        ],
        connectSrc: [
          "'self'",
          "https://api.surprisemoments.com",
          "wss://api.surprisemoments.com"
        ],
        mediaSrc: [
          "'self'", 
          "data:", 
          "blob:",
          "https:"
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }),

  /**
   * Configure CORS
   */
  cors: cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:3000',
        'https://surprisemoments.com',
        'https://www.surprisemoments.com'
      ].filter(Boolean);

      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
  }),

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    // General API rate limit
    general: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    }),

    // Stricter limit for authentication endpoints
    auth: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        error: 'Too many authentication attempts',
        message: 'Please try again later',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true,
      skipFailedRequests: false
    }),

    // File upload rate limit
    upload: rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 uploads per hour
      message: {
        error: 'Too many file uploads',
        message: 'Please try again later',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    }),

    // Surprise creation rate limit
    create: rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // limit each IP to 20 surprises per hour
      message: {
        error: 'Too many surprise creations',
        message: 'Please try again later',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    })
  },

  /**
   * Additional security middleware
   */
  additional: [
    // Prevent HTTP Parameter Pollution
    hpp({
      whitelist: ['category', 'tags', 'filter']
    }),

    // Sanitize data to prevent NoSQL injection
    mongoSanitize(),

    // Sanitize user input to prevent XSS
    xss(),

    // Prevent clickjacking
    (req, res, next) => {
      res.setHeader('X-Frame-Options', 'DENY');
      next();
    },

    // Prevent MIME type sniffing
    (req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      next();
    },

    // Referrer policy
    (req, res, next) => {
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    },

    // Permissions policy
    (req, res, next) => {
      res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), payment=()'
      );
      next();
    }
  ],

  /**
   * Request size limits
   */
  bodyParser: {
    json: { limit: '10mb' },
    urlencoded: { extended: true, limit: '10mb' }
  },

  /**
   * File upload security
   */
  fileUpload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ],
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.mp4', '.webm', '.mov', '.avi',
      '.mp3', '.wav', '.ogg'
    ]
  }
};

module.exports = securityMiddleware;
