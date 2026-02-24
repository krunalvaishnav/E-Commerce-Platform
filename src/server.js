const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const startServer = async () => {
  await prisma.$connect();
  console.log('Database connected');
  app.listen(env.port, () => {
    console.log(`Server started on port ${env.port}`);
  });
};

startServer();
