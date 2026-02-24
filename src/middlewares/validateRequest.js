const { ValidationError } = require('../utils/AppError');

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      return next();
    } catch (error) {
      const message = error.details
        ? error.details.map((detail) => detail.message).join(', ')
        : 'Validation error';
      return next(new ValidationError(message));
    }
  };
};

module.exports = validateRequest;
