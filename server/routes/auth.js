const express = require('express');
const { body, validationResult } = require('express-validator');
const { hashPassword, generateToken } = require('../utils/encryption');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// Factory function for router with injectable dependencies
function createAuthRouter({
  query = require('../config/database').query,
  verifyPassword = require('../utils/encryption').verifyPassword,
  jwt = require('jsonwebtoken')
} = {}) {
  const router = express.Router();

  // Validation middleware
  const validateRegistration = [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
  ];

  const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ];

  // Register new user
  router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array(),
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'A user with this email or username already exists',
        code: 'USER_EXISTS',
        timestamp: new Date().toISOString()
      });
    }

    // Hash password
    const hashedPassword = hashPassword(password);
    
    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const result = await query(
      `INSERT INTO users (email, username, password_hash, verification_token, verification_expiry, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, email, username, is_verified, created_at`,
      [email, username, hashedPassword, verificationToken, verificationExpiry]
    );

    const user = result.rows[0];

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.is_verified
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration Failed',
      message: 'Failed to create user account',
      code: 'REGISTRATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

  // Login user
  router.post('/login', validateLogin, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Please check your input',
          details: errors.array(),
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }

      const { email, password } = req.body;

      // Find user
      const result = await query(
        'SELECT id, email, username, password_hash, is_verified, created_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: 'Invalid Credentials',
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
      }

      const user = result.rows[0];

      // Verify password
      if (!verifyPassword(password, user.password_hash)) {
        return res.status(401).json({
          error: 'Invalid Credentials',
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isVerified: user.is_verified
        },
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login Failed',
        message: 'Failed to authenticate user',
        code: 'LOGIN_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Verify email
  router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await query(
      'SELECT id, email, verification_expiry FROM users WHERE verification_token = $1 AND is_verified = false',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid Token',
        message: 'Invalid or expired verification token',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    const user = result.rows[0];

    // Check if token is expired
    if (new Date() > user.verification_expiry) {
      return res.status(400).json({
        error: 'Token Expired',
        message: 'Verification token has expired',
        code: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString()
      });
    }

    // Mark user as verified
    await query(
      'UPDATE users SET is_verified = true, verification_token = NULL, verification_expiry = NULL WHERE id = $1',
      [user.id]
    );

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: 'Failed to verify email',
      code: 'VERIFICATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

  // Request password reset
  router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please provide a valid email address',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const { email } = req.body;

    const result = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists or not
      return res.json({
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }

    const user = result.rows[0];
    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      'UPDATE users SET reset_token = $1, reset_expiry = $2 WHERE id = $3',
      [resetToken, resetExpiry, user.id]
    );

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      message: 'If an account with this email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      error: 'Request Failed',
      message: 'Failed to process password reset request'
    });
  }
});


  // Reset password
  router.post('/reset-password', [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Please check your input',
          details: errors.array()
        });
      }

      const { token, password } = req.body;

      const result = await query(
        'SELECT id, email, reset_expiry FROM users WHERE reset_token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          error: 'Invalid Token',
          message: 'Invalid or expired reset token'
        });
      }

      const user = result.rows[0];

      // Check if token is expired
      if (new Date() > user.reset_expiry) {
        return res.status(400).json({
          error: 'Token Expired',
          message: 'Password reset token has expired'
        });
      }

      // Hash new password
      const hashedPassword = hashPassword(password);

      // Update password and clear reset token
      await query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_expiry = NULL WHERE id = $2',
        [hashedPassword, user.id]
      );

      res.json({
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        error: 'Reset Failed',
        message: 'Failed to reset password'
      });
    }
  });

  return router;
}

module.exports = createAuthRouter;


