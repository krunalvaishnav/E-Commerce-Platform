const prisma = require('../config/prisma');

const withTransaction = async (callback) => {
  return prisma.$transaction(async (tx) => {
    return callback(tx);
  });
};

const getUserById = async (tx, id) => {
  return tx.user.findUnique({
    where: { id }
  });
};

const getProductsByIds = async (tx, ids) => {
  return tx.product.findMany({
    where: {
      id: { in: ids }
    }
  });
};

const getCouponByCode = async (tx, code) => {
  return tx.coupon.findUnique({
    where: { code }
  });
};

const getWalletByUserId = async (tx, userId) => {
  return tx.wallet.findUnique({
    where: { userId }
  });
};

module.exports = {
  withTransaction,
  getUserById,
  getProductsByIds,
  getCouponByCode,
  getWalletByUserId
};
