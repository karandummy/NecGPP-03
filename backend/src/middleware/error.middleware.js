// backend/src/middleware/error.middleware.js

export const globalErrorHandler = (err, req, res, next) => {
  // Always log full error for internal monitoring
  console.error(err.stack || err); // Or use Pino/Winston + Sentry

  // Normalize defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific known errors (e.g., JWT – keep as is)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your token has expired. Please login again.',
    });
  }

  // For MySQL-specific errors (common with mysql2/pool)
  if (err.code === 'ER_DUP_ENTRY') {
    // Convert to operational error if it's from user input (e.g., duplicate email)
    // Extract field if possible: err.message includes "Key (email)=..."
    const field = err.message.match(/\((.*?)\)/)?.[1] || 'field';
    return res.status(409).json({
      success: false,
      message: `This ${field} is already taken. Please choose another.`,
    });
  }

  // Main distinction: Operational vs Unexpected
  if (err.isOperational) {
    // Trusted error – safe to show your custom message
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Unexpected error (e.g., DB crash, bug) – Hide details!
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our side. Please try again later.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Optional: show in dev
  });
};

