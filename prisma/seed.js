const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  await prisma.wallet.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const indianPassword = await bcrypt.hash('password-india', 10);
  const foreignPassword = await bcrypt.hash('password-foreign', 10);

  const indianUser = await prisma.user.create({
    data: {
      email: 'indian.user@example.in',
      password: indianPassword,
      country: 'IN',
      wallet: {
        create: {
          balance: 5000
        }
      }
    },
    include: {
      wallet: true
    }
  });

  const foreignUser = await prisma.user.create({
    data: {
      email: 'foreign.user@example.com',
      password: foreignPassword,
      country: 'US',
      wallet: {
        create: {
          balance: 10000
        }
      }
    },
    include: {
      wallet: true
    }
  });

  const product1 = await prisma.product.create({
    data: {
      name: 'Wireless Mouse',
      priceINR: 1500,
      stock: 100,
      isActive: true
    }
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Mechanical Keyboard',
      priceINR: 4500,
      stock: 50,
      isActive: true
    }
  });

  const coupon = await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      expiry: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      usageLimit: 100,
      usedCount: 0
    }
  });

  return {
    indianUser,
    foreignUser,
    product1,
    product2,
    coupon
  };
}

main()
  .then((result) => {
    return result;
  })
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
