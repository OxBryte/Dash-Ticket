import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Create Organizer
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      name: 'Sarah Jenkins',
      role: 'ORGANIZER',
    },
  })

  console.log(`Created organizer: ${organizer.name}`)

  // Create Venues
  const venue1 = await prisma.venue.create({
    data: {
      name: 'The Grand Hall',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      capacity: 500,
      description: 'A historic venue in the heart of the city.',
    }
  })
  
  const venue2 = await prisma.venue.create({
    data: {
      name: 'Sunset Amphitheater',
      address: '456 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90028',
      country: 'USA',
      capacity: 5000,
      description: 'Outdoor venue with amazing views.',
    }
  })

  console.log('Created venues')

  // Create Events
  const event1 = await prisma.event.create({
    data: {
      title: 'Summer Music Festival',
      description: 'A weekend of music and fun under the sun.',
      shortDescription: 'Best summer festival.',
      category: 'FESTIVAL',
      status: 'ON_SALE',
      startDate: new Date('2025-07-15T12:00:00Z'),
      endDate: new Date('2025-07-17T23:00:00Z'),
      organizerId: organizer.id,
      venueId: venue2.id,
      ticketTypes: {
        create: [
          {
            name: 'General Admission',
            description: 'Access to all stages.',
            price: 15000, // $150.00
            quantityTotal: 4000,
          },
          {
            name: 'VIP Pass',
            description: 'Access to VIP lounge and front row.',
            price: 35000, // $350.00
            quantityTotal: 500,
          }
        ]
      }
    }
  })

  const event2 = await prisma.event.create({
    data: {
      title: 'Tech Conference 2025',
      description: 'The future of technology is here.',
      shortDescription: 'Join us for the biggest tech event.',
      category: 'CONFERENCE',
      status: 'ON_SALE',
      startDate: new Date('2025-09-10T09:00:00Z'),
      endDate: new Date('2025-09-12T17:00:00Z'),
      organizerId: organizer.id,
      venueId: venue1.id,
      ticketTypes: {
        create: [
          {
            name: 'Early Bird',
            price: 29900,
            quantityTotal: 100,
          },
          {
            name: 'Regular',
            price: 49900,
            quantityTotal: 300,
          }
        ]
      }
    }
  })

  console.log(`Created events: ${event1.title}, ${event2.title}`)
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
