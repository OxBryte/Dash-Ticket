import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.ticket.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.ticketType.deleteMany()
  await prisma.event.deleteMany()
  await prisma.venue.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const organizer1 = await prisma.user.create({
    data: {
      name: 'Live Nation',
      email: 'organizer@livenation.com',
      password: hashedPassword,
      role: 'ORGANIZER'
    }
  })

  const organizer2 = await prisma.user.create({
    data: {
      name: 'AEG Presents',
      email: 'events@aegpresents.com',
      password: hashedPassword,
      role: 'ORGANIZER'
    }
  })

  const attendee = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'ATTENDEE'
    }
  })

  console.log('✅ Created 3 users (2 organizers, 1 attendee)')

  // Create venues
  console.log('Creating venues...')
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Madison Square Garden',
      address: '4 Pennsylvania Plaza',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      capacity: 20000
    }
  })

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Red Rocks Amphitheatre',
      address: '18300 W Alameda Pkwy',
      city: 'Morrison',
      state: 'CO',
      zip: '80465',
      country: 'USA',
      capacity: 9525
    }
  })

  const venue3 = await prisma.venue.create({
    data: {
      name: 'Hollywood Bowl',
      address: '2301 Highland Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90068',
      country: 'USA',
      capacity: 17500
    }
  })

  console.log('✅ Created 3 venues')

  // Create events
  console.log('Creating events...')
  const event1 = await prisma.event.create({
    data: {
      title: 'Taylor Swift | The Eras Tour',
      shortDescription: 'Experience the musical journey of Taylor Swift',
      description: 'Join us for an unforgettable night as Taylor Swift brings The Eras Tour to Madison Square Garden. This spectacular show will take you through every era of her incredible career, featuring hit songs from all her albums.',
      category: 'CONCERT',
      status: 'ON_SALE',
      startDate: new Date('2025-06-15T19:00:00'),
      endDate: new Date('2025-06-15T23:00:00'),
      timezone: 'America/New_York',
      imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      ageRestriction: 'All ages',
      refundPolicy: 'Refunds available up to 7 days before the event',
      organizerId: organizer1.id,
      venueId: venue1.id,
      ticketTypes: {
        create: [
          {
            name: 'General Admission',
            description: 'Standing room general admission',
            price: 15000,
            quantityTotal: 5000,
            maxPerOrder: 8,
            sortOrder: 0
          },
          {
            name: 'Reserved Seating',
            description: 'Reserved stadium seating',
            price: 25000,
            quantityTotal: 3000,
            maxPerOrder: 6,
            sortOrder: 1
          },
          {
            name: 'VIP Package',
            description: 'VIP seating with meet & greet',
            price: 50000,
            quantityTotal: 500,
            maxPerOrder: 4,
            sortOrder: 2
          }
        ]
      }
    }
  })

  const event2 = await prisma.event.create({
    data: {
      title: 'Coldplay: Music of the Spheres',
      shortDescription: 'An out-of-this-world concert experience',
      description: 'Coldplay returns with their spectacular Music of the Spheres World Tour. Experience stunning visuals, incredible music, and an unforgettable atmosphere at Red Rocks Amphitheatre.',
      category: 'CONCERT',
      status: 'ON_SALE',
      startDate: new Date('2025-07-22T20:00:00'),
      endDate: new Date('2025-07-22T23:30:00'),
      timezone: 'America/Denver',
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      ageRestriction: 'All ages',
      refundPolicy: 'No refunds, exchanges only',
      organizerId: organizer2.id,
      venueId: venue2.id,
      ticketTypes: {
        create: [
          {
            name: 'General Admission',
            description: 'General admission standing',
            price: 12500,
            quantityTotal: 4000,
            maxPerOrder: 6,
            sortOrder: 0
          },
          {
            name: 'Premium Seating',
            description: 'Premium reserved seating',
            price: 22500,
            quantityTotal: 2000,
            maxPerOrder: 4,
            sortOrder: 1
          }
        ]
      }
    }
  })

  const event3 = await prisma.event.create({
    data: {
      title: 'TechCrunch Disrupt 2025',
      shortDescription: 'The world\'s leading tech conference',
      description: 'Join thousands of entrepreneurs, investors, and tech enthusiasts at TechCrunch Disrupt 2025. Featuring keynotes from industry leaders, startup competitions, and networking opportunities.',
      category: 'CONFERENCE',
      status: 'ON_SALE',
      startDate: new Date('2025-09-10T09:00:00'),
      endDate: new Date('2025-09-12T18:00:00'),
      timezone: 'America/Los_Angeles',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      ageRestriction: '18+',
      refundPolicy: 'Full refund up to 30 days before event',
      organizerId: organizer1.id,
      venueId: venue3.id,
      ticketTypes: {
        create: [
          {
            name: 'Early Bird',
            description: '3-day pass with early access',
            price: 79900,
            quantityTotal: 500,
            maxPerOrder: 5,
            sortOrder: 0
          },
          {
            name: 'Standard Pass',
            description: '3-day full access pass',
            price: 99900,
            quantityTotal: 2000,
            maxPerOrder: 5,
            sortOrder: 1
          },
          {
            name: 'VIP Pass',
            description: 'VIP lounge access & exclusive sessions',
            price: 199900,
            quantityTotal: 200,
            maxPerOrder: 2,
            sortOrder: 2
          }
        ]
      }
    }
  })

  const event4 = await prisma.event.create({
    data: {
      title: 'NBA Finals Game 7',
      shortDescription: 'Championship deciding game',
      description: 'Witness history in the making! Game 7 of the NBA Finals at Madison Square Garden. Don\'t miss this epic showdown to crown the champions.',
      category: 'SPORTS',
      status: 'ON_SALE',
      startDate: new Date('2025-06-20T20:30:00'),
      endDate: new Date('2025-06-20T23:30:00'),
      timezone: 'America/New_York',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      ageRestriction: 'All ages',
      refundPolicy: 'No refunds',
      organizerId: organizer2.id,
      venueId: venue1.id,
      ticketTypes: {
        create: [
          {
            name: 'Upper Level',
            description: 'Upper level seating',
            price: 35000,
            quantityTotal: 5000,
            maxPerOrder: 6,
            sortOrder: 0
          },
          {
            name: 'Lower Bowl',
            description: 'Lower bowl seating',
            price: 75000,
            quantityTotal: 3000,
            maxPerOrder: 4,
            sortOrder: 1
          },
          {
            name: 'Courtside',
            description: 'Courtside premium seats',
            price: 250000,
            quantityTotal: 100,
            maxPerOrder: 2,
            sortOrder: 2
          }
        ]
      }
    }
  })

  console.log('✅ Created 4 events with ticket types')
  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📧 Login credentials:')
  console.log('   Organizer 1: organizer@livenation.com / password123')
  console.log('   Organizer 2: events@aegpresents.com / password123')
  console.log('   Attendee: john@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
