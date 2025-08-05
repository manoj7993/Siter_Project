const { PrismaClient } = require('@prisma/client');

let prisma;

const connectDB = () => {
  try {
    if (!prisma) {
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty',
      });
    }

    console.log('✅ Database connected successfully');
    return prisma;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  if (prisma) {
    await prisma.$disconnect();
    console.log('📡 Database disconnected');
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDB();
});

module.exports = { connectDB, disconnectDB, prisma };
