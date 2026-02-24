const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/AppError');
const env = require('../config/env');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authorization token missing'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = { id: decoded.userId, email: decoded.email };
    return next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
};

module.exports = authenticate;
