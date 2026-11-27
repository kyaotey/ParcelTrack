const { isDev } = require('../config/env');
const AppError = require('../utils/AppError');

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target;
    const message = target
      ? `Resource already exists (conflict on: ${target})`
      : 'Resource already exists';
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        details: null,
      },
    });
  }

  if (err && err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        details: null,
      },
    });
  }

  if (err instanceof AppError || err?.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
        details: null,
      },
    });
  }

  if (err && err.name === 'ZodError') {
    const details = (err.issues || []).map((issue) => ({
      field: Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path || ''),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    });
  }

  if (isDev) {
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: null,
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
