const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  country: Joi.string().min(2).optional()
});

const checkoutPreviewSchema = Joi.object({
  cartItems: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required()
      })
    )
    .min(1)
    .required(),
  couponCode: Joi.string().allow('', null),
  walletAmountToUse: Joi.number().min(0)
});

module.exports = {
  loginSchema,
  signupSchema,
  checkoutPreviewSchema
};
