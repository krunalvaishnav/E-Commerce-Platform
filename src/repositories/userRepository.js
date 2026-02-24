const prisma = require('../config/prisma');

const getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return user;
  } catch (error) {
    throw error;
  }
};

const createUser = async (data) => {
  try {
    const user = await prisma.user.create({
      data,
      include: {
        wallet: true
      }
    });
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserByEmail,
  createUser
};
