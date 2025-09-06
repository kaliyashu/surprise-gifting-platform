const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const assetManager = require('../utils/assetManager');

const router = express.Router();

/**
 * GET /api/assets/templates
 * Get all available templates
 */
router.get('/templates', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    const templates = assetManager.getTemplates(category);
    
    res.json({
      success: true,
      templates: templates.map(template => ({
        id: template.name,
        name: template.displayName,
        category: template.category,
        description: template.description,
        config: template.config,
        isPremium: template.isPremium,
        tags: template.tags || [],
        preview: template.preview
      }))
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve templates'
    });
  }
});

/**
 * GET /api/assets/templates/:id
 * Get specific template by ID
 */
router.get('/templates/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const template = assetManager.getTemplate(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      template: {
        id: template.name,
        name: template.displayName,
        category: template.category,
        description: template.description,
        config: template.config,
        isPremium: template.isPremium,
        tags: template.tags || [],
        preview: template.preview
      }
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve template'
    });
  }
});

/**
 * GET /api/assets/videos
 * Get all available video animations
 */
router.get('/videos', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    const videos = assetManager.getVideoAnimations(category);
    
    res.json({
      success: true,
      videos: videos.map(video => ({
        id: video.name,
        name: video.name,
        category: video.category,
        url: video.url,
        size: video.size,
        duration: video.duration
      }))
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve videos'
    });
  }
});

/**
 * GET /api/assets/videos/:id
 * Get specific video animation by ID
 */
router.get('/videos/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const video = assetManager.getVideoAnimation(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video animation not found'
      });
    }
    
    res.json({
      success: true,
      video: {
        id: video.name,
        name: video.name,
        category: video.category,
        url: video.url,
        size: video.size,
        duration: video.duration
      }
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve video'
    });
  }
});

/**
 * GET /api/assets/cursor
 * Get all available cursor animations
 */
router.get('/cursor', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    const animations = assetManager.getCursorAnimations(category);
    
    res.json({
      success: true,
      animations: animations.map(animation => ({
        id: animation.name,
        name: animation.name,
        type: animation.type,
        category: animation.category,
        description: animation.description,
        config: animation.config,
        triggers: animation.triggers,
        performance: animation.performance,
        tags: animation.tags || []
      }))
    });
  } catch (error) {
    console.error('Get cursor animations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cursor animations'
    });
  }
});

/**
 * GET /api/assets/cursor/:id
 * Get specific cursor animation by ID
 */
router.get('/cursor/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const animation = assetManager.getCursorAnimation(id);
    
    if (!animation) {
      return res.status(404).json({
        success: false,
        error: 'Cursor animation not found'
      });
    }
    
    res.json({
      success: true,
      animation: {
        id: animation.name,
        name: animation.name,
        type: animation.type,
        category: animation.category,
        description: animation.description,
        config: animation.config,
        triggers: animation.triggers,
        performance: animation.performance,
        tags: animation.tags || []
      }
    });
  } catch (error) {
    console.error('Get cursor animation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cursor animation'
    });
  }
});

/**
 * GET /api/assets/stats
 * Get asset statistics (admin only)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you can implement your own admin check)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const stats = assetManager.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stats'
    });
  }
});

/**
 * POST /api/assets/refresh
 * Refresh asset cache (admin only)
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    await assetManager.scanAssets();
    
    res.json({
      success: true,
      message: 'Assets refreshed successfully',
      stats: assetManager.getStats()
    });
  } catch (error) {
    console.error('Refresh assets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh assets'
    });
  }
});

module.exports = router;
