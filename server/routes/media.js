const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Import Azure services
const azureStorage = require('../utils/azureStorage');
const azureAppInsights = require('../utils/azureAppInsights');

const router = express.Router();

// Configure multer for file uploads (memory storage for Azure)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
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
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // Max 10 files
  }
});

/**
 * POST /api/media/upload
 * Upload media files
 */
router.post('/upload', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      let fileUrl;
      
      // Upload to Azure Storage if configured, otherwise use local storage
      if (process.env.AZURE_STORAGE_ACCOUNT && process.env.AZURE_STORAGE_KEY) {
        try {
          fileUrl = await azureStorage.uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            'uploads'
          );
          
          // Track successful Azure upload
          azureAppInsights.trackFileUpload(req.user.id, file.mimetype, file.size, true);
        } catch (error) {
          console.error('Azure upload failed, falling back to local storage:', error);
          azureAppInsights.trackFileUpload(req.user.id, file.mimetype, file.size, false);
          
          // Fallback to local storage
          const uploadDir = path.join(__dirname, '../uploads');
          await fs.mkdir(uploadDir, { recursive: true });
          const filename = `${uuidv4()}${path.extname(file.originalname)}`;
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, file.buffer);
          fileUrl = `/uploads/${filename}`;
        }
      } else {
        // Local storage fallback
        const uploadDir = path.join(__dirname, '../uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        const filename = `${uuidv4()}${path.extname(file.originalname)}`;
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, file.buffer);
        fileUrl = `/uploads/${filename}`;
      }

      // Save file info to database
      const result = await query(
        `INSERT INTO media_files (user_id, filename, original_name, mime_type, size, path, azure_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, filename`,
        [
          req.user.id,
          file.originalname,
          file.originalname,
          file.mimetype,
          file.size,
          fileUrl,
          fileUrl.startsWith('http') ? fileUrl : null
        ]
      );

      uploadedFiles.push({
        id: result.rows[0].id,
        filename: result.rows[0].filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl
      });
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
});

/**
 * GET /api/media/files
 * Get user's uploaded files
 */
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, filename, original_name, mime_type, size, created_at
       FROM media_files
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const files = result.rows.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      mimeType: file.mime_type,
      size: file.size,
      url: `/uploads/${file.filename}`,
      createdAt: file.created_at
    }));

    res.json({
      success: true,
      files
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve files'
    });
  }
});

/**
 * DELETE /api/media/files/:id
 * Delete a file
 */
router.delete('/files/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get file info
    const fileResult = await query(
      'SELECT filename, path FROM media_files WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const file = fileResult.rows[0];

    // Delete from database
    await query('DELETE FROM media_files WHERE id = $1', [id]);

    // Delete from filesystem
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.warn('Failed to delete file from filesystem:', error);
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

module.exports = router;
