const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

class AzureStorageService {
  constructor() {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${process.env.AZURE_STORAGE_ACCOUNT};AccountKey=${process.env.AZURE_STORAGE_KEY};EndpointSuffix=core.windows.net`
    );
  }

  /**
   * Upload a file to Azure Blob Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} containerName - Container name (default: 'uploads')
   * @returns {Promise<string>} - Public URL of uploaded file
   */
  async uploadFile(fileBuffer, originalName, mimeType, containerName = 'uploads') {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      
      // Ensure container exists
      await containerClient.createIfNotExists({
        access: 'blob' // Public read access
      });

      // Generate unique filename
      const fileExtension = originalName.split('.').pop();
      const blobName = `${uuidv4()}.${fileExtension}`;
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      // Upload file
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { 
          blobContentType: mimeType,
          blobCacheControl: 'public, max-age=31536000' // 1 year cache
        }
      });

      return blockBlobClient.url;
    } catch (error) {
      console.error('Azure Storage upload error:', error);
      throw new Error('Failed to upload file to Azure Storage');
    }
  }

  /**
   * Delete a file from Azure Blob Storage
   * @param {string} fileUrl - Full URL of the file to delete
   * @param {string} containerName - Container name
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(fileUrl, containerName = 'uploads') {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      
      // Extract blob name from URL
      const urlParts = fileUrl.split('/');
      const blobName = urlParts[urlParts.length - 1];
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
      
      return true;
    } catch (error) {
      console.error('Azure Storage delete error:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   * @param {string} fileUrl - Full URL of the file
   * @param {string} containerName - Container name
   * @returns {Promise<Object>} - File metadata
   */
  async getFileMetadata(fileUrl, containerName = 'uploads') {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      
      // Extract blob name from URL
      const urlParts = fileUrl.split('/');
      const blobName = urlParts[urlParts.length - 1];
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const properties = await blockBlobClient.getProperties();
      
      return {
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        etag: properties.etag
      };
    } catch (error) {
      console.error('Azure Storage metadata error:', error);
      return null;
    }
  }

  /**
   * Generate SAS token for temporary access
   * @param {string} fileUrl - Full URL of the file
   * @param {number} expiresInHours - Hours until token expires
   * @param {string} containerName - Container name
   * @returns {Promise<string>} - SAS token URL
   */
  async generateSasToken(fileUrl, expiresInHours = 1, containerName = 'uploads') {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      
      // Extract blob name from URL
      const urlParts = fileUrl.split('/');
      const blobName = urlParts[urlParts.length - 1];
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const sasToken = await blockBlobClient.generateSasUrl({
        permissions: 'r',
        expiresOn: new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      });
      
      return sasToken;
    } catch (error) {
      console.error('Azure Storage SAS token error:', error);
      throw new Error('Failed to generate SAS token');
    }
  }

  /**
   * List files in a container
   * @param {string} containerName - Container name
   * @param {string} prefix - File prefix filter
   * @returns {Promise<Array>} - List of files
   */
  async listFiles(containerName = 'uploads', prefix = '') {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const files = [];
      
      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        files.push({
          name: blob.name,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
          url: `${containerClient.url}/${blob.name}`
        });
      }
      
      return files;
    } catch (error) {
      console.error('Azure Storage list error:', error);
      return [];
    }
  }
}

module.exports = new AzureStorageService();

