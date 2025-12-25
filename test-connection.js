const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Successfully connected to PostgreSQL database')
    
    const userCount = await prisma.user.count()
    const eventCount = await prisma.event.count()
    
    console.log(`📊 Users: ${userCount}`)
    console.log(`📊 Events: ${eventCount}`)
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
  })
