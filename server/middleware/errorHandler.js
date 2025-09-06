const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let error = err.error || 'Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = 'Validation Error';
    message = err.message;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    error = 'Invalid ID';
    message = 'The provided ID is not valid';
  }

  if (err.code === '23505') { // PostgreSQL unique constraint violation
    statusCode = 409;
    error = 'Duplicate Entry';
    message = 'This record already exists';
  }

  if (err.code === '23503') { // PostgreSQL foreign key constraint violation
    statusCode = 400;
    error = 'Reference Error';
    message = 'Referenced record does not exist';
  }

  if (err.code === 'ENOENT') {
    statusCode = 404;
    error = 'File Not Found';
    message = 'The requested file could not be found';
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    error = 'File Too Large';
    message = 'The uploaded file exceeds the maximum allowed size';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    error = 'Unexpected File';
    message = 'Unexpected file field in upload';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error = 'Invalid Token';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error = 'Token Expired';
    message = 'Authentication token has expired';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    error = 'Too Many Files';
    message = 'Too many files uploaded';
  }

  // Rate limiting errors
  if (err.status === 429) {
    statusCode = 429;
    error = 'Too Many Requests';
    message = 'Rate limit exceeded. Please try again later.';
  }

  // Send error response
  res.status(statusCode).json({
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

module.exports = {
  errorHandler
};
