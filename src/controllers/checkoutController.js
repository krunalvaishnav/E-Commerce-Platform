const checkoutService = require('../services/checkoutService');
const { UnauthorizedError } = require('../utils/AppError');

const preview = async (req, res, next) => {
  try {
    const { cartItems, couponCode, walletAmountToUse } = req.body;
    if (!req.user || !req.user.id) {
      return next(new UnauthorizedError('Unauthorized'));
    }

    const result = await checkoutService.previewCheckout(
      req.user.id,
      cartItems,
      couponCode,
      walletAmountToUse
    );

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  preview
};
