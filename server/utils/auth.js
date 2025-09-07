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
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
    const salt = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

// Verify password with proper error handling
const verifyPassword = async (password, hash) => {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    if (!hash || typeof hash !== 'string') {
      throw new Error('Hash must be a non-empty string');
    }
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
};

// Generate secure random token (hex)
const generateToken = (length = 32) => {
  try {
    if (length < 16 || length > 128) {
      throw new Error('Token length must be between 16 and 128 characters');
    }
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

// Generate URL-safe token (Base64URL)
const generateUrlSafeToken = (length = 32) => {
  try {
    if (length < 16 || length > 128) {
      throw new Error('Token length must be between 16 and 128 characters');
    }
    return crypto.randomBytes(Math.ceil((length * 3) / 4)).toString('base64url').slice(0, length);
  } catch (error) {
    throw new Error(`URL-safe token generation failed: ${error.message}`);
  }
};

// Hash token for DB storage (sha256 + optional salt)
const hashUrlToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a non-empty string');
    }
    return crypto
      .createHash('sha256')
      .update(token + (process.env.TOKEN_SALT || 'default-salt'))
      .digest('hex');
  } catch (error) {
    throw new Error(`Token hashing failed: ${error.message}`);
  }
};

// Generate short-lived access JWT
const generateJWT = (payload, options = {}) => {
  try {
    validateEnvironment();
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be a valid object');
    }

    const sanitized = { ...payload };
    delete sanitized.password;
    delete sanitized.hash;
    delete sanitized.password_hash;

    const defaultOptions = {
      expiresIn: '15m',
      issuer: process.env.JWT_ISSUER || 'surprise-gifting-platform',
      audience: process.env.JWT_AUDIENCE || 'surprise-platform-users',
      algorithm: 'HS256',
    };

    const securePayload = {
      ...sanitized,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomBytes(16).toString('hex'),
    };

    return jwt.sign(securePayload, process.env.JWT_SECRET, { ...defaultOptions, ...options });
  } catch (error) {
    throw new Error(`JWT generation failed: ${error.message}`);
  }
};

// Generate refresh JWT (longer-lived)
const generateRefreshJWT = (payload, options = {}) => {
  try {
    validateEnvironment();
    const sanitized = { ...payload };
    delete sanitized.password;
    delete sanitized.hash;
    delete sanitized.password_hash;

    const defaultOptions = {
      expiresIn: '7d',
      issuer: process.env.JWT_ISSUER || 'surprise-gifting-platform',
      audience: process.env.JWT_AUDIENCE || 'surprise-platform-users',
      algorithm: 'HS256',
    };

    const securePayload = {
      ...sanitized,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomBytes(16).toString('hex'),
      type: 'refresh',
    };

    return jwt.sign(securePayload, process.env.JWT_REFRESH_SECRET, { ...defaultOptions, ...options });
  } catch (error) {
    throw new Error(`Refresh JWT generation failed: ${error.message}`);
  }
};

// Verify access JWT
const verifyJWT = (token, options = {}) => {
  try {
    validateEnvironment();
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a non-empty string');
    }
    const defaultOptions = {
      issuer: process.env.JWT_ISSUER || 'surprise-gifting-platform',
      audience: process.env.JWT_AUDIENCE || 'surprise-platform-users',
      algorithms: ['HS256'],
    };
    return jwt.verify(token, process.env.JWT_SECRET, { ...defaultOptions, ...options });
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new Error('Token has expired');
    if (error.name === 'JsonWebTokenError') throw new Error('Invalid token');
    if (error.name === 'NotBeforeError') throw new Error('Token not active yet');
    throw new Error(`JWT verification failed: ${error.message}`);
  }
};

// Verify refresh JWT
const verifyRefreshJWT = (token, options = {}) => {
  try {
    validateEnvironment();
    if (!token || typeof token !== 'string') {
      throw new Error('Refresh token must be a non-empty string');
    }
    const defaultOptions = {
      issuer: process.env.JWT_ISSUER || 'surprise-gifting-platform',
      audience: process.env.JWT_AUDIENCE || 'surprise-platform-users',
      algorithms: ['HS256'],
    };
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET,
      { ...defaultOptions, ...options }
    );
    if (decoded.type !== 'refresh') throw new Error('Invalid token type');
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new Error('Refresh token has expired');
    if (error.name === 'JsonWebTokenError') throw new Error('Invalid refresh token');
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};

// Optional: random opaque refresh token (if storing opaque tokens)
const generateRefreshToken = () => {
  try {
    return crypto.randomBytes(64).toString('hex');
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};

// Quick format check for a JWT (header.payload.signature)
const validateTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
};

module.exports = {
  validateEnvironment,
  hashPassword,
  verifyPassword,
  generateToken,
  generateUrlSafeToken,
  hashUrlToken,
  generateJWT,
  verifyJWT,
  generateRefreshJWT,
  verifyRefreshJWT,
  generateRefreshToken,
  validateTokenFormat,
};
