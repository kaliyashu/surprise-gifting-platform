const express = require('express');
const router = express.Router();
const assetManager = require('../utils/assetManager');

/**
 * GET /api/templates
 * Get all available templates
 */
router.get('/', async (req, res) => {
  try {
    const { category, interactive } = req.query;
    
    let templates = Array.from(assetManager.templates.values());
    
    // Filter by category if specified
    if (category && category !== 'all') {
      templates = templates.filter(template => template.category === category);
    }
    
    // Filter by interactive if specified
    if (interactive !== undefined) {
      const isInteractive = interactive === 'true';
      templates = templates.filter(template => template.interactive === isInteractive);
    }
    
    // Sort templates by category and name
    templates.sort((a, b) => {
      if (a.category === b.category) {
        return a.name.localeCompare(b.name);
      }
      return a.category.localeCompare(b.category);
    });
    
    res.json({
      success: true,
      templates: templates,
      total: templates.length,
      categories: [...new Set(templates.map(t => t.category))],
      interactiveCount: templates.filter(t => t.interactive).length,
      classicCount: templates.filter(t => !t.interactive).length
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find template by ID
    const template = Array.from(assetManager.templates.values())
      .find(t => t.id === id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      template: template
    });
    
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
});

/**
 * GET /api/templates/category/:category
 * Get templates by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const templates = Array.from(assetManager.templates.values())
      .filter(template => template.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({
      success: true,
      category: category,
      templates: templates,
      total: templates.length
    });
    
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates by category'
    });
  }
});

/**
 * GET /api/templates/interactive/:type
 * Get interactive or classic templates
 */
router.get('/interactive/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (type !== 'true' && type !== 'false') {
      return res.status(400).json({
        success: false,
        error: 'Type must be "true" or "false"'
      });
    }
    
    const isInteractive = type === 'true';
    const templates = Array.from(assetManager.templates.values())
      .filter(template => template.interactive === isInteractive)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({
      success: true,
      interactive: isInteractive,
      templates: templates,
      total: templates.length
    });
    
  } catch (error) {
    console.error('Error fetching templates by type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates by type'
    });
  }
});

/**
 * GET /api/templates/search/:query
 * Search templates by name or description
 */
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();
    
    const templates = Array.from(assetManager.templates.values())
      .filter(template => 
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.category.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({
      success: true,
      query: query,
      templates: templates,
      total: templates.length
    });
    
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search templates'
    });
  }
});

/**
 * GET /api/templates/stats/overview
 * Get template statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const templates = Array.from(assetManager.templates.values());
    
    const stats = {
      total: templates.length,
      categories: {},
      interactive: {
        total: templates.filter(t => t.interactive).length,
        percentage: Math.round((templates.filter(t => t.interactive).length / templates.length) * 100)
      },
      classic: {
        total: templates.filter(t => !t.interactive).length,
        percentage: Math.round((templates.filter(t => !t.interactive).length / templates.length) * 100)
      }
    };
    
    // Count by category
    templates.forEach(template => {
      if (!stats.categories[template.category]) {
        stats.categories[template.category] = 0;
      }
      stats.categories[template.category]++;
    });
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template stats'
    });
  }
});

module.exports = router;
