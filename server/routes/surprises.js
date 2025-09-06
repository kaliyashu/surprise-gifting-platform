const { body, validationResult } = require('express-validator');
const express = require('express');
module.exports = function createSurprisesRouter({
  query = require('../config/database').query,
  generateUrlSafeToken = require('../utils/encryption').generateUrlSafeToken,
  hashUrlToken = require('../utils/encryption').hashUrlToken,
  encrypt = require('../utils/encryption').encrypt,
  decrypt = require('../utils/encryption').decrypt,
  authenticateToken = require('../middleware/auth').authenticateToken,
  optionalAuth = require('../middleware/auth').optionalAuth
} = {}) {
  const router = express.Router();

  // Validation middleware
  const validateSurprise = [
    body('title').isLength({ min: 1, max: 100 }),
    body('occasion').isIn(['birthday', 'anniversary', 'love', 'friendship', 'graduation', 'wedding', 'other']),
    body('templateId').isUUID(),
    body('revelations').isArray({ min: 1, max: 10 }),
    body('revelations.*.type').isIn(['message', 'image', 'video', 'audio']),
    body('revelations.*.content').notEmpty(),
    body('revelations.*.order').isInt({ min: 1 }),
    body('password').optional().isLength({ min: 4, max: 50 }),
    body('expiresAt').optional().isISO8601()
  ];

  // Create a new surprise
  router.post('/', authenticateToken, validateSurprise, async (req, res) => {
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

      const {
        title,
        occasion,
        templateId,
        revelations,
        password,
        expiresAt,
        isPublic = false
      } = req.body;

      const userId = req.user.id;

      // Generate unique token for the surprise
      const token = generateUrlSafeToken(32);
      const tokenHash = hashUrlToken(token);

      // Encrypt sensitive content
      const encryptedRevelations = revelations.map(revelation => ({
        ...revelation,
        content: encrypt(revelation.content)
      }));

      // Create surprise
      const surpriseResult = await query(
        `INSERT INTO surprises (
          user_id, title, occasion, template_id, revelations, 
          password_hash, token_hash, expires_at, is_public, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, created_at`,
        [
          userId,
          title,
          occasion,
          templateId,
          JSON.stringify(encryptedRevelations),
          password ? encrypt(password) : null,
          tokenHash,
          expiresAt,
          isPublic
        ]
      );

      const surprise = surpriseResult.rows[0];

      res.status(201).json({
        message: 'Surprise created successfully',
        surprise: {
          id: surprise.id,
          token,
          title,
          occasion,
          templateId,
          revelationsCount: revelations.length,
          hasPassword: !!password,
          expiresAt,
          isPublic,
          createdAt: surprise.created_at,
          shareUrl: `${process.env.CLIENT_URL}/surprise/${token}`
        }
      });

    } catch (error) {
      console.error('Create surprise error:', error);
      res.status(500).json({
        error: 'Creation Failed',
        message: 'Failed to create surprise',
        code: 'CREATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get surprise by token (for viewers)
  router.get('/:token', optionalAuth, async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.query;

      const tokenHash = hashUrlToken(token);

      // Get surprise
      const result = await query(
        `SELECT s.*, t.name as template_name, t.config as template_config
         FROM surprises s
         LEFT JOIN templates t ON s.template_id = t.id
         WHERE s.token_hash = $1 AND (s.is_public = true OR s.user_id = $2)`,
        [tokenHash, req.user?.id || null]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Surprise not found or access denied',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }

      const surprise = result.rows[0];

      // Check if expired
      if (surprise.expires_at && new Date() > surprise.expires_at) {
        return res.status(410).json({
          error: 'Expired',
          message: 'This surprise has expired'
        });
      }

      // Check password if required
      if (surprise.password_hash) {
        if (!password) {
          return res.status(401).json({
            error: 'Password Required',
            message: 'This surprise is password protected',
            requiresPassword: true
          });
        }

        const decryptedPassword = decrypt(surprise.password_hash);
        if (password !== decryptedPassword) {
          return res.status(401).json({
            error: 'Invalid Password',
            message: 'Incorrect password'
          });
        }
      }

      // Decrypt revelations
      const revelations = JSON.parse(surprise.revelations).map(revelation => ({
        ...revelation,
        content: decrypt(revelation.content)
      }));

      // Increment view count
      await query(
        'UPDATE surprises SET view_count = view_count + 1 WHERE id = $1',
        [surprise.id]
      );

      res.json({
        surprise: {
          id: surprise.id,
          title: surprise.title,
          occasion: surprise.occasion,
          template: {
            id: surprise.template_id,
            name: surprise.template_name,
            config: surprise.template_config
          },
          revelations,
          hasPassword: !!surprise.password_hash,
          isPublic: surprise.is_public,
          createdAt: surprise.created_at,
          viewCount: surprise.view_count + 1
        }
      });

    } catch (error) {
      console.error('Get surprise error:', error);
      res.status(500).json({
        error: 'Retrieval Failed',
        message: 'Failed to retrieve surprise',
        code: 'RETRIEVAL_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  });

  // ...other routes unchanged, move them here as needed...

  // Catch-all 404 for this router
  router.use((req, res, next) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'Surprise not found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler for this router
  router.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      error: err.error || 'Internal Server Error',
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    });
  });

  // Get user's surprises
  router.get('/user/me', authenticateToken, async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const userId = req.user.id;

      const result = await query(
        `SELECT s.*, t.name as template_name,
                COUNT(*) OVER() as total_count
         FROM surprises s
         LEFT JOIN templates t ON s.template_id = t.id
         WHERE s.user_id = $1
         ORDER BY s.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const surprises = result.rows.map(surprise => ({
        id: surprise.id,
        title: surprise.title,
        occasion: surprise.occasion,
        template: {
          id: surprise.template_id,
          name: surprise.template_name
        },
        hasPassword: !!surprise.password_hash,
        isPublic: surprise.is_public,
        viewCount: surprise.view_count,
        createdAt: surprise.created_at,
        expiresAt: surprise.expires_at,
        shareUrl: `${process.env.CLIENT_URL}/surprise/${surprise.token_hash}`
      }));

      const totalCount = result.rows[0]?.total_count || 0;

      res.json({
        surprises,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount),
          pages: Math.ceil(totalCount / limit)
        }
      });

    } catch (error) {
      console.error('Get user surprises error:', error);
      res.status(500).json({
        error: 'Retrieval Failed',
        message: 'Failed to retrieve surprises',
        code: 'RETRIEVAL_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Update surprise
  router.put('/:id', authenticateToken, [
    body('title').isLength({ min: 1, max: 100 }),
    body('occasion').isIn(['birthday', 'anniversary', 'love', 'friendship', 'graduation', 'wedding', 'other']),
    body('templateId').isUUID(),
    body('revelations').isArray({ min: 1, max: 10 }),
    body('revelations.*.type').isIn(['message', 'image', 'video', 'audio']),
    body('revelations.*.content').notEmpty(),
    body('revelations.*.order').isInt({ min: 1 }),
    body('password').optional().isLength({ min: 4, max: 50 }),
    body('expiresAt').optional().isISO8601()
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

      const { id } = req.params;
      const userId = req.user.id;
      const {
        title,
        occasion,
        templateId,
        revelations,
        password,
        expiresAt,
        isPublic
      } = req.body;

      // Check ownership
      const ownershipCheck = await query(
        'SELECT id FROM surprises WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (ownershipCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Surprise not found or access denied'
        });
      }

      // Encrypt revelations
      const encryptedRevelations = revelations.map(revelation => ({
        ...revelation,
        content: encrypt(revelation.content)
      }));

      // Update surprise
      await query(
        `UPDATE surprises SET
          title = $1, occasion = $2, template_id = $3, revelations = $4,
          password_hash = $5, expires_at = $6, is_public = $7, updated_at = NOW()
         WHERE id = $8 AND user_id = $9`,
        [
          title,
          occasion,
          templateId,
          JSON.stringify(encryptedRevelations),
          password ? encrypt(password) : null,
          expiresAt,
          isPublic,
          id,
          userId
        ]
      );

      res.json({
        message: 'Surprise updated successfully',
        surprise: {
          id,
          title,
          occasion,
          templateId,
          revelationsCount: revelations.length,
          hasPassword: !!password,
          expiresAt,
          isPublic
        }
      });

    } catch (error) {
      console.error('Update surprise error:', error);
      res.status(500).json({
        error: 'Update Failed',
        message: 'Failed to update surprise',
        code: 'UPDATE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Delete surprise
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check ownership
      const ownershipCheck = await query(
        'SELECT id FROM surprises WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (ownershipCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Surprise not found or access denied'
        });
      }

      // Delete surprise
      await query(
        'DELETE FROM surprises WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      res.json({
        message: 'Surprise deleted successfully'
      });

    } catch (error) {
      console.error('Delete surprise error:', error);
      res.status(500).json({
        error: 'Deletion Failed',
        message: 'Failed to delete surprise'
      });
    }
  });

  // Get surprise analytics
  router.get('/:id/analytics', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check ownership
      const result = await query(
        `SELECT s.*, 
                COUNT(v.id) as total_views,
                COUNT(DISTINCT v.viewer_ip) as unique_views,
                MAX(v.viewed_at) as last_viewed
         FROM surprises s
         LEFT JOIN surprise_views v ON s.id = v.surprise_id
         WHERE s.id = $1 AND s.user_id = $2
         GROUP BY s.id`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Surprise not found or access denied'
        });
      }

      const surprise = result.rows[0];

      res.json({
        analytics: {
          id: surprise.id,
          title: surprise.title,
          totalViews: parseInt(surprise.total_views),
          uniqueViews: parseInt(surprise.unique_views),
          lastViewed: surprise.last_viewed,
          createdAt: surprise.created_at,
          shareUrl: `${process.env.CLIENT_URL}/surprise/${surprise.token_hash}`
        }
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        error: 'Retrieval Failed',
        message: 'Failed to retrieve analytics'
      });
    }
  });

  return router;

  // Update surprise
  router.put('/:id', authenticateToken, [
    body('title').isLength({ min: 1, max: 100 }),
    body('occasion').isIn(['birthday', 'anniversary', 'love', 'friendship', 'graduation', 'wedding', 'other']),
    body('templateId').isUUID(),
    body('revelations').isArray({ min: 1, max: 10 }),
    body('revelations.*.type').isIn(['message', 'image', 'video', 'audio']),
    body('revelations.*.content').notEmpty(),
    body('revelations.*.order').isInt({ min: 1 }),
    body('password').optional().isLength({ min: 4, max: 50 }),
    body('expiresAt').optional().isISO8601()
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

      const { id } = req.params;
      const userId = req.user.id;
      const {
        title,
        occasion,
        templateId,
        revelations,
        password,
        expiresAt,
        isPublic
      } = req.body;

      // Check ownership
      const ownershipCheck = await query(
        'SELECT id FROM surprises WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (ownershipCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Surprise not found or access denied'
        });
      }

      // Encrypt revelations
      const encryptedRevelations = revelations.map(revelation => ({
        ...revelation,
        content: encrypt(revelation.content)
      }));

      // Update surprise
      await query(
        `UPDATE surprises SET
          title = $1, occasion = $2, template_id = $3, revelations = $4,
          password_hash = $5, expires_at = $6, is_public = $7, updated_at = NOW()
         WHERE id = $8 AND user_id = $9`,
        [
          title,
          occasion,
          templateId,
          JSON.stringify(encryptedRevelations),
          password ? encrypt(password) : null,
          expiresAt,
          isPublic,
          id,
          userId
        ]
      );

      res.json({
        message: 'Surprise updated successfully',
        surprise: {
          id,
          title,
          occasion,
          templateId,
          revelationsCount: revelations.length,
          hasPassword: !!password,
          expiresAt,
          isPublic
        }
      });

    } catch (error) {
      console.error('Update surprise error:', error);
      res.status(500).json({
        error: 'Update Failed',
        message: 'Failed to update surprise',
        code: 'UPDATE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Delete surprise
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check ownership
      const ownershipCheck = await query(
        'SELECT id FROM surprises WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (ownershipCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Surprise not found or access denied'
        });
      }

      // Delete surprise
      await query(
        'DELETE FROM surprises WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      res.json({
        message: 'Surprise deleted successfully'
      });

    } catch (error) {
      console.error('Delete surprise error:', error);
      res.status(500).json({
        error: 'Deletion Failed',
        message: 'Failed to delete surprise'
      });
    }
  });

  // Get surprise analytics
  router.get('/:id/analytics', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check ownership
      const result = await query(
        `SELECT s.*, 
                COUNT(v.id) as total_views,
                COUNT(DISTINCT v.viewer_ip) as unique_views,
                MAX(v.viewed_at) as last_viewed
         FROM surprises s
         LEFT JOIN surprise_views v ON s.id = v.surprise_id
         WHERE s.id = $1 AND s.user_id = $2
         GROUP BY s.id`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Surprise not found or access denied'
        });
      }

      const surprise = result.rows[0];

      res.json({
        analytics: {
          id: surprise.id,
          title: surprise.title,
          totalViews: parseInt(surprise.total_views),
          uniqueViews: parseInt(surprise.unique_views),
          lastViewed: surprise.last_viewed,
          createdAt: surprise.created_at,
          shareUrl: `${process.env.CLIENT_URL}/surprise/${surprise.token_hash}`
        }
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        error: 'Retrieval Failed',
        message: 'Failed to retrieve analytics'
      });
    }
  });

  return router;
}
