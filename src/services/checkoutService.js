const { AppError } = require('../utils/AppError');
const checkoutRepository = require('../repositories/checkoutRepository');
const { convertINRToUSD, roundToTwo } = require('../utils/currency');

const previewCheckout = async (userId, cartItems, couponCode, walletAmountToUse) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new AppError('Cart items are required', 400);
  }

  const normalizedWalletAmount = Number(walletAmountToUse || 0);
  if (Number.isNaN(normalizedWalletAmount) || normalizedWalletAmount < 0) {
    throw new AppError('Invalid wallet amount', 400);
  }

  try {
    return await checkoutRepository.withTransaction(async (tx) => {
      const user = await checkoutRepository.getUserById(tx, userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const productIds = cartItems.map((item) => item.productId);
      const uniqueProductIds = Array.from(new Set(productIds));
      const products = await checkoutRepository.getProductsByIds(tx, uniqueProductIds);

      if (products.length !== uniqueProductIds.length) {
        throw new AppError('One or more products not found', 404);
      }

      const productMap = new Map(products.map((product) => [product.id, product]));

      let subtotal = 0;
      for (const item of cartItems) {
        if (!item || !item.productId || !item.quantity || item.quantity <= 0) {
          throw new AppError('Invalid cart item', 400);
        }
        const product = productMap.get(item.productId);
        if (!product) {
          throw new AppError('Product not found', 404);
        }
        if (!product.isActive) {
          throw new AppError('Product is inactive', 400);
        }
        if (product.stock < item.quantity) {
          throw new AppError('Insufficient stock for product', 400);
        }
        subtotal += product.priceINR * item.quantity;
      }

      let discount = 0;
      if (couponCode) {
        const coupon = await checkoutRepository.getCouponByCode(tx, couponCode);
        if (!coupon) {
          throw new AppError('Coupon not found', 404);
        }
        if (coupon.expiry < new Date()) {
          throw new AppError('Coupon expired', 400);
        }
        if (coupon.usedCount >= coupon.usageLimit) {
          throw new AppError('Coupon usage limit reached', 400);
        }

        if (coupon.type === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.value) / 100);
        } else {
          discount = coupon.value;
        }
        if (discount > subtotal) {
          discount = subtotal;
        }
      }

      const maxWalletAllowed = subtotal - discount;
      let walletDeduction = 0;
      if (normalizedWalletAmount > 0) {
        const wallet = await checkoutRepository.getWalletByUserId(tx, userId);
        if (!wallet) {
          throw new AppError('Wallet not found', 404);
        }
        if (normalizedWalletAmount > wallet.balance) {
          throw new AppError('Wallet amount exceeds balance', 400);
        }
        if (normalizedWalletAmount > maxWalletAllowed) {
          throw new AppError('Wallet amount exceeds payable amount', 400);
        }
        walletDeduction = normalizedWalletAmount;
      }

      let finalPayable = subtotal - discount - walletDeduction;
      if (finalPayable < 0) {
        finalPayable = 0;
      }

      const isIndia =
        String(user.country).toUpperCase() === 'IN' ||
        String(user.country).toLowerCase() === 'india';

      if (!isIndia) {
        return {
          subtotal: convertINRToUSD(subtotal),
          discount: convertINRToUSD(discount),
          walletDeduction: convertINRToUSD(walletDeduction),
          finalPayable: convertINRToUSD(finalPayable),
          currency: 'USD'
        };
      }

      return {
        subtotal: roundToTwo(subtotal),
        discount: roundToTwo(discount),
        walletDeduction: roundToTwo(walletDeduction),
        finalPayable: roundToTwo(finalPayable),
        currency: 'INR'
      };
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Checkout preview failed', 500);
  }
};

module.exports = {
  previewCheckout
};
