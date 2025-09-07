const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Validate required environment variables
const validateEnvironment = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
};

// Hash password with proper error handling
const hashPassword = async (password) => {
    try {
        // Input validation
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }
        
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        // Use async version for better performance
        const saltRounds = 12; // Increased from 10 for better security
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
        
    } catch (error) {
        throw new Error(`Password hashing failed: ${error.message}`);
    }
};

// Verify password with proper error handling
const verifyPassword = async (password, hash) => {
    try {
        // Input validation
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }
        
        if (!hash || typeof hash !== 'string') {
            throw new Error('Hash must be a non-empty string');
        }
        
        // Use async version for better performance
        return await bcrypt.compare(password, hash);
        
    } catch (error) {
        throw new Error(`Password verification failed: ${error.message}`);
    }
};

// Generate secure verification token
const generateToken = (length = 32) => {
    try {
        // Input validation
        if (length < 16 || length > 128) {
            throw new Error('Token length must be between 16 and 128 characters');
        }
        
        // Use crypto.randomBytes for cryptographically secure tokens
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
        
    } catch (error) {
        throw new Error(`Token generation failed: ${error.message}`);
    }
};

// Generate JWT token with enhanced security
const generateJWT = (payload, options = {}) => {
    try {
        // Validate environment
        validateEnvironment();
        
        // Input validation
        if (!payload || typeof payload !== 'object') {
            throw new Error('Payload must be a valid object');
        }
        
        // Remove sensitive data from payload
        const sanitizedPayload = { ...payload };
        delete sanitizedPayload.password;
        delete sanitizedPayload.hash;
        delete sanitizedPayload.password_hash;
        
        // Default options with security best practices
        const defaultOptions = {
            expiresIn: '15m', // Shortened for better security
            issuer: process.env.JWT_ISSUER || 'surprise-platform',
            audience: process.env.JWT_AUDIENCE || 'surprise-users',
            algorithm: 'HS256'
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Add security claims
        const securePayload = {
            ...sanitizedPayload,
            iat: Math.floor(Date.now() / 1000),
            jti: crypto.randomBytes(16).toString('hex') // JWT ID for uniqueness
        };
        
        return jwt.sign(securePayload, process.env.JWT_SECRET, mergedOptions);
        
    } catch (error) {
        throw new Error(`JWT generation failed: ${error.message}`);
    }
};

// Verify JWT token with enhanced security
const verifyJWT = (token, options = {}) => {
    try {
        // Validate environment
        validateEnvironment();
        
        // Input validation
        if (!token || typeof token !== 'string') {
            throw new Error('Token must be a non-empty string');
        }
        
        // Default options
        const defaultOptions = {
            issuer: process.env.JWT_ISSUER || 'surprise-platform',
            audience: process.env.JWT_AUDIENCE || 'surprise-users',
            algorithms: ['HS256'] // Specify allowed algorithms
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Verify and decode token
        return jwt.verify(token, process.env.JWT_SECRET, mergedOptions);
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Token not active yet');
        } else {
            throw new Error(`JWT verification failed: ${error.message}`);
        }
    }
};

// Generate secure URL-safe token for surprise links
const generateUrlSafeToken = (length = 32) => {
    try {
        if (length < 16 || length > 128) {
            throw new Error('Token length must be between 16 and 128 characters');
        }
        
        return crypto.randomBytes(Math.ceil(length * 3/4)).toString('base64url').slice(0, length);
    } catch (error) {
        throw new Error(`URL-safe token generation failed: ${error.message}`);
    }
};

// Hash URL token for database storage
const hashUrlToken = (token) => {
    try {
        if (!token || typeof token !== 'string') {
            throw new Error('Token must be a non-empty string');
        }
        
        return crypto.createHash('sha256').update(token + (process.env.TOKEN_SALT || 'default-salt')).digest('hex');
    } catch (error) {
        throw new Error(`Token hashing failed: ${error.message}`);
    }
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    generateJWT,
    verifyJWT,
    validateEnvironment,
    generateUrlSafeToken,
    hashUrlToken
};
