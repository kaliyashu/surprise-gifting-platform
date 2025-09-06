const appInsights = require('applicationinsights');

class AzureAppInsightsService {
  constructor() {
    this.connectionString = process.env.AZURE_APP_INSIGHTS_CONNECTION_STRING;
    this.isInitialized = false;
  }

  /**
   * Initialize Application Insights
   */
  initialize() {
    if (!this.connectionString) {
      console.warn('⚠️ Azure Application Insights connection string not found');
      return false;
    }

    try {
      appInsights.setup(this.connectionString)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .setInternalLogging(true, true)
        .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
        .start();

      this.isInitialized = true;
      console.log('✅ Azure Application Insights initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Application Insights:', error);
      return false;
    }
  }

  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {Object} properties - Event properties
   * @param {Object} measurements - Event measurements
   */
  trackEvent(eventName, properties = {}, measurements = {}) {
    if (!this.isInitialized) return;

    try {
      appInsights.defaultClient.trackEvent({
        name: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        },
        measurements
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track a custom metric
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {Object} properties - Metric properties
   */
  trackMetric(metricName, value, properties = {}) {
    if (!this.isInitialized) return;

    try {
      appInsights.defaultClient.trackMetric({
        name: metricName,
        value: value,
        properties: {
          ...properties,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track metric:', error);
    }
  }

  /**
   * Track an exception
   * @param {Error} error - Error object
   * @param {Object} properties - Exception properties
   * @param {Object} measurements - Exception measurements
   */
  trackException(error, properties = {}, measurements = {}) {
    if (!this.isInitialized) return;

    try {
      appInsights.defaultClient.trackException({
        exception: error,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        },
        measurements
      });
    } catch (err) {
      console.error('Failed to track exception:', err);
    }
  }

  /**
   * Track a request
   * @param {string} name - Request name
   * @param {string} url - Request URL
   * @param {number} duration - Request duration in milliseconds
   * @param {number} resultCode - HTTP result code
   * @param {boolean} success - Request success status
   * @param {Object} properties - Request properties
   */
  trackRequest(name, url, duration, resultCode, success, properties = {}) {
    if (!this.isInitialized) return;

    try {
      appInsights.defaultClient.trackRequest({
        name: name,
        url: url,
        duration: duration,
        resultCode: resultCode,
        success: success,
        properties: {
          ...properties,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track request:', error);
    }
  }

  /**
   * Track user action
   * @param {string} userId - User ID
   * @param {string} action - User action
   * @param {Object} properties - Action properties
   */
  trackUserAction(userId, action, properties = {}) {
    this.trackEvent('UserAction', {
      userId,
      action,
      ...properties
    });
  }

  /**
   * Track surprise creation
   * @param {string} userId - User ID
   * @param {string} surpriseType - Type of surprise
   * @param {string} occasion - Occasion
   * @param {number} revelationCount - Number of revelations
   */
  trackSurpriseCreation(userId, surpriseType, occasion, revelationCount) {
    this.trackEvent('SurpriseCreated', {
      userId,
      surpriseType,
      occasion,
      revelationCount
    }, {
      revelationCount
    });
  }

  /**
   * Track surprise view
   * @param {string} surpriseId - Surprise ID
   * @param {string} viewerType - Type of viewer (creator/recipient)
   * @param {number} viewDuration - View duration in seconds
   */
  trackSurpriseView(surpriseId, viewerType, viewDuration) {
    this.trackEvent('SurpriseViewed', {
      surpriseId,
      viewerType
    }, {
      viewDuration
    });
  }

  /**
   * Track file upload
   * @param {string} userId - User ID
   * @param {string} fileType - Type of file
   * @param {number} fileSize - File size in bytes
   * @param {boolean} success - Upload success status
   */
  trackFileUpload(userId, fileType, fileSize, success) {
    this.trackEvent('FileUploaded', {
      userId,
      fileType,
      success: success.toString()
    }, {
      fileSize
    });
  }

  /**
   * Track authentication
   * @param {string} userId - User ID
   * @param {string} authMethod - Authentication method
   * @param {boolean} success - Authentication success status
   */
  trackAuthentication(userId, authMethod, success) {
    this.trackEvent('UserAuthenticated', {
      userId,
      authMethod,
      success: success.toString()
    });
  }

  /**
   * Track performance metric
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   * @param {string} unit - Metric unit
   */
  trackPerformance(metricName, value, unit = 'ms') {
    this.trackMetric(metricName, value, {
      unit,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track database operation
   * @param {string} operation - Database operation
   * @param {string} table - Table name
   * @param {number} duration - Operation duration
   * @param {boolean} success - Operation success status
   */
  trackDatabaseOperation(operation, table, duration, success) {
    this.trackEvent('DatabaseOperation', {
      operation,
      table,
      success: success.toString()
    }, {
      duration
    });
  }

  /**
   * Track API endpoint usage
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} statusCode - HTTP status code
   */
  trackApiUsage(endpoint, method, responseTime, statusCode) {
    this.trackRequest(
      `${method} ${endpoint}`,
      endpoint,
      responseTime,
      statusCode,
      statusCode < 400
    );
  }

  /**
   * Get Application Insights client
   * @returns {Object} - App Insights client
   */
  getClient() {
    return appInsights.defaultClient;
  }

  /**
   * Flush telemetry data
   */
  flush() {
    if (this.isInitialized) {
      appInsights.defaultClient.flush();
    }
  }
}

module.exports = new AzureAppInsightsService();

