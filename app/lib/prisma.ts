import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    transactionOptions: {
      maxWait: 10000, // 10 seconds
      timeout: 20000, // 20 seconds
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

