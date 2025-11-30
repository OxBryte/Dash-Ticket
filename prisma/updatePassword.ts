import bcrypt from 'bcryptjs'
import { prisma } from '../app/lib/prisma'

async function updatePassword() {
  const hashedPassword = await bcrypt.hash('password123', 10)
  await prisma.user.update({
    where: { email: 'organizer@example.com' },
    data: { password: hashedPassword }
  })
  console.log('✅ Updated organizer password to: password123')
  await prisma.$disconnect()
}

updatePassword()

