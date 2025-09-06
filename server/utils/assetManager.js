const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class AssetManager {
  constructor() {
    this.assetsPath = path.join(__dirname, '../assets');
    this.animations = new Map();
    this.templates = new Map();
    this.cursorAnimations = new Map();
    this.videoAnimations = new Map();
    this.cache = new Map();
    this.lastScan = null;
  }

  /**
   * Initialize asset manager and scan for files
   */
  async initialize() {
    try {
      console.log('🔄 Initializing Asset Manager...');
      
      // Create directories if they don't exist
      await this.ensureDirectories();
      
      // Scan all assets
      await this.scanAssets();
      
      // Set up file watcher for development
      if (process.env.NODE_ENV === 'development') {
        this.setupFileWatcher();
      }
      
      console.log('✅ Asset Manager initialized successfully');
      console.log(`📁 Found ${this.templates.size} templates`);
      console.log(`🎬 Found ${this.videoAnimations.size} video animations`);
      console.log(`🖱️ Found ${this.cursorAnimations.size} cursor animations`);
      
    } catch (error) {
      console.error('❌ Asset Manager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const directories = [
      'animations/video',
      'animations/cursor',
      'templates',
      'uploads',
      'previews'
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.assetsPath, dir);
      try {
        await fs.access(fullPath);
      } catch {
        await fs.mkdir(fullPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  /**
   * Scan all assets and load them into memory
   */
  async scanAssets() {
    try {
      // Scan templates
      await this.scanTemplates();
      
      // Scan video animations
      await this.scanVideoAnimations();
      
      // Scan cursor animations
      await this.scanCursorAnimations();
      
      this.lastScan = Date.now();
      
    } catch (error) {
      console.error('❌ Asset scanning failed:', error);
      throw error;
    }
  }

  /**
   * Scan template files
   */
  async scanTemplates() {
    const templatesPath = path.join(this.assetsPath, 'templates');
    
    try {
      const categories = await fs.readdir(templatesPath);
      
      for (const category of categories) {
        const categoryPath = path.join(templatesPath, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              await this.loadTemplate(category, file);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Template scanning failed:', error.message);
    }
  }

  /**
   * Load a single template file
   */
  async loadTemplate(category, filename) {
    try {
      const filePath = path.join(this.assetsPath, 'templates', category, filename);
      const content = await fs.readFile(filePath, 'utf8');
      const template = JSON.parse(content);
      
      // Validate template
      if (this.validateTemplate(template)) {
        const key = `${category}/${filename.replace('.json', '')}`;
        this.templates.set(key, {
          ...template,
          category,
          filename,
          filePath,
          lastModified: (await fs.stat(filePath)).mtime
        });
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load template ${category}/${filename}:`, error.message);
    }
  }

  /**
   * Scan video animation files
   */
  async scanVideoAnimations() {
    const videosPath = path.join(this.assetsPath, 'animations/video');
    
    try {
      const categories = await fs.readdir(videosPath);
      
      for (const category of categories) {
        const categoryPath = path.join(videosPath, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            if (this.isVideoFile(file)) {
              await this.loadVideoAnimation(category, file);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Video animation scanning failed:', error.message);
    }
  }

  /**
   * Load a single video animation
   */
  async loadVideoAnimation(category, filename) {
    try {
      const filePath = path.join(this.assetsPath, 'animations/video', category, filename);
      const stat = await fs.stat(filePath);
      
      const key = `${category}/${filename}`;
      this.videoAnimations.set(key, {
        name: filename.replace(/\.[^/.]+$/, ''),
        category,
        filename,
        filePath,
        url: `/assets/animations/video/${category}/${filename}`,
        size: stat.size,
        lastModified: stat.mtime,
        duration: await this.getVideoDuration(filePath)
      });
    } catch (error) {
      console.warn(`⚠️ Failed to load video ${category}/${filename}:`, error.message);
    }
  }

  /**
   * Scan cursor animation files
   */
  async scanCursorAnimations() {
    const cursorPath = path.join(this.assetsPath, 'animations/cursor');
    
    try {
      const categories = await fs.readdir(cursorPath);
      
      for (const category of categories) {
        const categoryPath = path.join(cursorPath, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              await this.loadCursorAnimation(category, file);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Cursor animation scanning failed:', error.message);
    }
  }

  /**
   * Load a single cursor animation
   */
  async loadCursorAnimation(category, filename) {
    try {
      const filePath = path.join(this.assetsPath, 'animations/cursor', category, filename);
      const content = await fs.readFile(filePath, 'utf8');
      const animation = JSON.parse(content);
      
      // Validate cursor animation
      if (this.validateCursorAnimation(animation)) {
        const key = `${category}/${filename.replace('.json', '')}`;
        this.cursorAnimations.set(key, {
          ...animation,
          category,
          filename,
          filePath,
          lastModified: (await fs.stat(filePath)).mtime
        });
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load cursor animation ${category}/${filename}:`, error.message);
    }
  }

  /**
   * Setup file watcher for development
   */
  setupFileWatcher() {
    const chokidar = require('chokidar');
    
    const watcher = chokidar.watch([
      path.join(this.assetsPath, 'templates/**/*.json'),
      path.join(this.assetsPath, 'animations/cursor/**/*.json'),
      path.join(this.assetsPath, 'animations/video/**/*')
    ], {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    watcher
      .on('add', (filePath) => this.handleFileChange('add', filePath))
      .on('change', (filePath) => this.handleFileChange('change', filePath))
      .on('unlink', (filePath) => this.handleFileChange('unlink', filePath));

    console.log('👀 File watcher enabled for development');
  }

  /**
   * Handle file changes
   */
  async handleFileChange(event, filePath) {
    try {
      const relativePath = path.relative(this.assetsPath, filePath);
      console.log(`📝 File ${event}: ${relativePath}`);
      
      // Debounce file changes
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.scanAssets();
      }, 1000);
      
    } catch (error) {
      console.error('❌ File change handling failed:', error);
    }
  }

  /**
   * Get all templates
   */
  getTemplates(category = null) {
    if (category) {
      return Array.from(this.templates.values())
        .filter(template => template.category === category && template.isActive);
    }
    return Array.from(this.templates.values())
      .filter(template => template.isActive);
  }

  /**
   * Get template by key
   */
  getTemplate(key) {
    return this.templates.get(key);
  }

  /**
   * Get all video animations
   */
  getVideoAnimations(category = null) {
    if (category) {
      return Array.from(this.videoAnimations.values())
        .filter(video => video.category === category);
    }
    return Array.from(this.videoAnimations.values());
  }

  /**
   * Get video animation by key
   */
  getVideoAnimation(key) {
    return this.videoAnimations.get(key);
  }

  /**
   * Get all cursor animations
   */
  getCursorAnimations(category = null) {
    if (category) {
      return Array.from(this.cursorAnimations.values())
        .filter(animation => animation.category === category && animation.enabled);
    }
    return Array.from(this.cursorAnimations.values())
      .filter(animation => animation.enabled);
  }

  /**
   * Get cursor animation by key
   */
  getCursorAnimation(key) {
    return this.cursorAnimations.get(key);
  }

  /**
   * Validate template structure
   */
  validateTemplate(template) {
    const required = ['name', 'displayName', 'category', 'config'];
    return required.every(field => template.hasOwnProperty(field));
  }

  /**
   * Validate cursor animation structure
   */
  validateCursorAnimation(animation) {
    const required = ['name', 'type', 'category', 'config'];
    return required.every(field => animation.hasOwnProperty(field));
  }

  /**
   * Check if file is a video
   */
  isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  /**
   * Get video duration (placeholder - implement with ffprobe)
   */
  async getVideoDuration(filePath) {
    // TODO: Implement with ffprobe for actual duration
    return 5000; // Default 5 seconds
  }

  /**
   * Get asset statistics
   */
  getStats() {
    return {
      templates: this.templates.size,
      videoAnimations: this.videoAnimations.size,
      cursorAnimations: this.cursorAnimations.size,
      lastScan: this.lastScan,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Asset cache cleared');
  }
}

module.exports = new AssetManager();
