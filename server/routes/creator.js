const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

const router = express.Router();

/**
 * GET /api/creator/dashboard
 * Get creator dashboard statistics
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's surprises count
    const surprisesResult = await query(
      'SELECT COUNT(*) as total FROM surprises WHERE user_id = $1',
      [userId]
    );

    // Get total views
    const viewsResult = await query(
      'SELECT SUM(view_count) as total_views FROM surprises WHERE user_id = $1',
      [userId]
    );

    // Get recent surprises
    const recentResult = await query(
      `SELECT id, title, occasion, view_count, created_at
       FROM surprises
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Get popular surprises
    const popularResult = await query(
      `SELECT id, title, occasion, view_count, created_at
       FROM surprises
       WHERE user_id = $1
       ORDER BY view_count DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      dashboard: {
        totalSurprises: parseInt(surprisesResult.rows[0].total),
        totalViews: parseInt(viewsResult.rows[0].total_views) || 0,
        recentSurprises: recentResult.rows,
        popularSurprises: popularResult.rows
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

/**
 * GET /api/creator/analytics
 * Get detailed analytics
 */
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    // Get surprises created in the last period
    const periodResult = await query(
      `SELECT COUNT(*) as count, DATE(created_at) as date
       FROM surprises
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${period} days'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [userId]
    );

    // Get views in the last period
    const viewsResult = await query(
      `SELECT SUM(view_count) as views, DATE(created_at) as date
       FROM surprises
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${period} days'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [userId]
    );

    // Get top performing surprises
    const topResult = await query(
      `SELECT id, title, occasion, view_count, created_at
       FROM surprises
       WHERE user_id = $1
       ORDER BY view_count DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      analytics: {
        period: parseInt(period),
        surprisesByDay: periodResult.rows,
        viewsByDay: viewsResult.rows,
        topSurprises: topResult.rows
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

/**
 * GET /api/creator/settings
 * Get creator settings
 */
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user settings
    const result = await query(
      'SELECT username, email, is_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      settings: {
        username: user.username,
        email: user.email,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve settings'
    });
  }
});

/**
 * PUT /api/creator/settings
 * Update creator settings
 */
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    // Validate input
    if (username && username.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters long'
      });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Update user settings
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (username) {
      updateFields.push(`username = $${paramCount}`);
      updateValues.push(username);
      paramCount++;
    }

    if (email) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateValues.push(userId);

    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING username, email, updated_at`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        username: result.rows[0].username,
        email: result.rows[0].email,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

module.exports = router;
