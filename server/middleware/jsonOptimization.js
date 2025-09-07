const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);

// JSON Performance Cache
class JSONCache {
    constructor(maxSize = 1000, ttl = 300000) { // 5 minutes TTL
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
        this.hits = 0;
        this.misses = 0;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.misses++;
            return null;
        }

        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        // Move to end (LRU behavior)
        this.cache.delete(key);
        this.cache.set(key, item);
        this.hits++;
        return item.value;
    }

    set(key, value) {
        // Remove oldest if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    clear() {
        this.cache.clear();
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: this.hits / (this.hits + this.misses) || 0
        };
    }
}

const jsonCache = new JSONCache();

// Safe JSON parsing with error handling
const safeJSONParse = (jsonString, fallback = null) => {
    try {
        if (!jsonString || typeof jsonString !== 'string') {
            return fallback;
        }

        // Check cache first
        const cacheKey = `parse_${jsonString.length}_${jsonString.slice(0, 50)}`;
        const cached = jsonCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const result = JSON.parse(jsonString);
        
        // Cache the result if it's not too large
        if (jsonString.length < 10000) {
            jsonCache.set(cacheKey, result);
        }

        return result;
    } catch (error) {
        console.error('JSON Parse Error:', {
            message: error.message,
            preview: jsonString ? jsonString.substring(0, 100) + '...' : 'null',
            length: jsonString ? jsonString.length : 0
        });
        return fallback;
    }
};

// Middleware for JSON optimization
const jsonOptimizationMiddleware = (req, res, next) => {
    // Override res.json to add optimization
    const originalJson = res.json.bind(res);
    
    res.json = function(obj) {
        // Skip optimization for small payloads
        const jsonString = JSON.stringify(obj);
        
        if (jsonString.length < 1024) {
            return originalJson(obj);
        }

        // Set optimization headers
        res.setHeader('X-JSON-Optimized', 'true');
        res.setHeader('X-Original-Size', jsonString.length);

        // Check if client accepts compression
        const acceptEncoding = req.headers['accept-encoding'] || '';
        
        if (acceptEncoding.includes('gzip')) {
            gzip(jsonString).then(compressed => {
                res.setHeader('Content-Encoding', 'gzip');
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('X-Compressed-Size', compressed.length);
                res.end(compressed);
            }).catch(error => {
                console.error('Compression failed:', error);
                originalJson(obj);
            });
        } else {
            return originalJson(obj);
        }
    };

    next();
};

module.exports = {
    jsonOptimizationMiddleware,
    safeJSONParse,
    jsonCache
};
