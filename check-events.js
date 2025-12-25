const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Checking events in database...\n')
  
  const events = await prisma.event.findMany({
    include: {
      venue: true,
      ticketTypes: true,
      organizer: true
    }
  })
  
  console.log(`Total events: ${events.length}\n`)
  
  events.forEach(event => {
    console.log(`Event: ${event.title}`)
    console.log(`  ID: ${event.id}`)
    console.log(`  Organizer: ${event.organizer?.name} (${event.organizerId})`)
    console.log(`  Status: ${event.status}`)
    console.log(`  Created: ${event.createdAt}`)
    console.log('---')
  })
  
  console.log('\nChecking users...\n')
  const users = await prisma.user.findMany({
    where: { role: 'ORGANIZER' }
  })
  
  console.log(`Total organizers: ${users.length}\n`)
  users.forEach(user => {
    console.log(`Organizer: ${user.name}`)
    console.log(`  ID: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log('---')
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
  })
