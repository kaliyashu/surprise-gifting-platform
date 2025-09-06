const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;

// Encrypt data
const encrypt = (text) => {
  if (!text) return null;
  
  try {
    // Generate a random salt
    const salt = crypto.randomBytes(saltLength);
    
    // Generate key from secret and salt
    const key = crypto.pbkdf2Sync(secretKey, salt, 100000, 32, 'sha256');
    
    // Generate random IV
    const iv = crypto.randomBytes(ivLength);
    
    // Create cipher
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(salt);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const result = salt.toString('hex') + ':' + iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data
const decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];
    
    // Generate key from secret and salt
    const key = crypto.pbkdf2Sync(secretKey, salt, 100000, 32, 'sha256');
    
    // Create decipher
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(salt);
    decipher.setAuthTag(tag);
    
    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Hash password for storage
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// Verify password
const verifyPassword = (password, hashedPassword) => {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Generate secure random token
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate URL-safe token
const generateUrlSafeToken = (length = 32) => {
  return crypto.randomBytes(length).toString('base64url');
};

// Hash URL token for anti-tampering
const hashUrlToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateToken,
  generateUrlSafeToken,
  hashUrlToken
};
