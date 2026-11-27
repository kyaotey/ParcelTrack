const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch {
      throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401, 'UNAUTHORIZED');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'FORBIDDEN');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401, 'UNAUTHORIZED'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this resource`,
          403,
          'FORBIDDEN'
        )
      );
    }
    next();
  };
}

module.exports = { authenticate, authorize };
