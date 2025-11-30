import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding with real data...')

  // Create Real Organizers
  const organizer1 = await prisma.user.upsert({
    where: { email: 'events@livenation.com' },
    update: {},
    create: {
      email: 'events@livenation.com',
      name: 'Live Nation Entertainment',
      role: 'ORGANIZER',
      password: await bcrypt.hash('SecurePass2025!', 10),
    },
  })

  const organizer2 = await prisma.user.upsert({
    where: { email: 'booking@msg.com' },
    update: {},
    create: {
      email: 'booking@msg.com',
      name: 'Madison Square Garden',
      role: 'ORGANIZER',
      password: await bcrypt.hash('MSG2025Events!', 10),
    },
  })

  const organizer3 = await prisma.user.upsert({
    where: { email: 'info@techsummit.com' },
    update: {},
    create: {
      email: 'info@techsummit.com',
      name: 'Tech Summit Productions',
      role: 'ORGANIZER',
      password: await bcrypt.hash('TechSummit2025!', 10),
    },
  })

  console.log(`Created organizers: ${organizer1.name}, ${organizer2.name}, ${organizer3.name}`)

  // Create Real Venues
  const venues = [
    {
      name: 'Madison Square Garden',
      address: '4 Pennsylvania Plaza',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      capacity: 20000,
      latitude: 40.7505,
      longitude: -73.9934,
      description: 'The World\'s Most Famous Arena. Hosting concerts, sports, and entertainment since 1968.',
    },
    {
      name: 'Red Rocks Amphitheatre',
      address: '18300 W Alameda Pkwy',
      city: 'Morrison',
      state: 'CO',
      zip: '80465',
      country: 'USA',
      capacity: 9525,
      latitude: 39.6653,
      longitude: -105.2056,
      description: 'Iconic natural amphitheater carved out of red rock formations. One of the most beautiful concert venues in the world.',
    },
    {
      name: 'The Fillmore',
      address: '1805 Geary Blvd',
      city: 'San Francisco',
      state: 'CA',
      zip: '94115',
      country: 'USA',
      capacity: 1200,
      latitude: 37.7849,
      longitude: -122.4324,
      description: 'Historic music venue in the heart of San Francisco. Known for intimate performances and legendary acoustics.',
    },
    {
      name: 'Wrigley Field',
      address: '1060 W Addison St',
      city: 'Chicago',
      state: 'IL',
      zip: '60613',
      country: 'USA',
      capacity: 41649,
      latitude: 41.9484,
      longitude: -87.6553,
      description: 'Historic baseball stadium and concert venue. Home of the Chicago Cubs since 1914.',
    },
    {
      name: 'The Hollywood Bowl',
      address: '2301 N Highland Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90068',
      country: 'USA',
      capacity: 17500,
      latitude: 34.1123,
      longitude: -118.3389,
      description: 'Iconic outdoor amphitheater in the Hollywood Hills. Hosts world-class concerts and events year-round.',
    },
    {
      name: 'Moscone Center',
      address: '747 Howard St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      country: 'USA',
      capacity: 20000,
      latitude: 37.7849,
      longitude: -122.4008,
      description: 'Premier convention center in downtown San Francisco. Hosts major tech conferences and trade shows.',
    },
  ]

  const createdVenues = []
  for (const venue of venues) {
    // Check if venue exists by name and address
    const existing = await prisma.venue.findFirst({
      where: {
        name: venue.name,
        address: venue.address,
      },
    })
    
    const v = existing || await prisma.venue.create({
      data: venue,
    })
    createdVenues.push(v)
  }

  console.log(`Created ${createdVenues.length} venues`)

  // Create Real Events
  const events = [
    {
      title: 'Taylor Swift | The Eras Tour',
      shortDescription: 'Experience the musical journey through all of Taylor\'s eras',
      description: 'Join Taylor Swift for an unforgettable night featuring songs from all her albums. This spectacular production includes elaborate stage designs, costume changes, and performances of fan-favorite hits spanning her entire career. Doors open at 6:00 PM, show starts at 7:30 PM. Merchandise available at multiple locations throughout the venue.',
      category: 'CONCERT',
      status: 'ON_SALE',
      startDate: new Date('2025-06-15T19:30:00-04:00'),
      endDate: new Date('2025-06-15T23:00:00-04:00'),
      doorsOpen: new Date('2025-06-15T18:00:00-04:00'),
      timezone: 'America/New_York',
      ageRestriction: 'ALL_AGES',
      refundPolicy: 'Tickets are non-refundable except in case of event cancellation. Refunds will be processed within 30 days.',
      organizerId: organizer1.id,
      venueId: createdVenues[0].id, // MSG
      ticketTypes: [
        {
          name: 'Upper Level',
          description: 'Upper level seating with excellent views of the stage',
          price: 14900, // $149
          quantityTotal: 8000,
          maxPerOrder: 8,
        },
        {
          name: 'Lower Level',
          description: 'Lower level seating closer to the stage',
          price: 29900, // $299
          quantityTotal: 6000,
          maxPerOrder: 6,
        },
        {
          name: 'Floor Seating',
          description: 'Premium floor seats with direct stage view',
          price: 49900, // $499
          quantityTotal: 3000,
          maxPerOrder: 4,
        },
        {
          name: 'VIP Experience',
          description: 'Includes premium seating, exclusive merchandise, early entry, and meet & greet opportunity',
          price: 99900, // $999
          quantityTotal: 200,
          maxPerOrder: 2,
        },
      ],
    },
    {
      title: 'Coldplay: Music of the Spheres World Tour',
      shortDescription: 'A cosmic journey through Coldplay\'s greatest hits',
      description: 'Coldplay brings their spectacular Music of the Spheres World Tour to Red Rocks. Experience an immersive show featuring stunning visuals, pyrotechnics, and performances of hits from their latest album plus fan favorites. The band is known for their incredible live performances and this show promises to be unforgettable. Show starts at 8:00 PM.',
      category: 'CONCERT',
      status: 'ON_SALE',
      startDate: new Date('2025-07-22T20:00:00-06:00'),
      endDate: new Date('2025-07-22T23:30:00-06:00'),
      doorsOpen: new Date('2025-07-22T18:30:00-06:00'),
      timezone: 'America/Denver',
      ageRestriction: 'ALL_AGES',
      refundPolicy: 'Refunds available up to 48 hours before event. No refunds after that time.',
      organizerId: organizer1.id,
      venueId: createdVenues[1].id, // Red Rocks
      ticketTypes: [
        {
          name: 'General Admission',
          description: 'General admission seating in the natural amphitheater',
          price: 12500, // $125
          quantityTotal: 8000,
          maxPerOrder: 6,
        },
        {
          name: 'Reserved Seating',
          description: 'Reserved seats in premium sections',
          price: 19900, // $199
          quantityTotal: 1500,
          maxPerOrder: 4,
        },
      ],
    },
    {
      title: 'Arctic Monkeys Live',
      shortDescription: 'Intimate performance at The Fillmore',
      description: 'Arctic Monkeys return to San Francisco for a special intimate performance at The Fillmore. Experience their latest album "The Car" plus classic hits in this historic venue. Limited capacity ensures an unforgettable experience. Doors at 7:00 PM, show at 8:00 PM.',
      category: 'CONCERT',
      status: 'ON_SALE',
      startDate: new Date('2025-08-10T20:00:00-07:00'),
      endDate: new Date('2025-08-10T23:00:00-07:00'),
      doorsOpen: new Date('2025-08-10T19:00:00-07:00'),
      timezone: 'America/Los_Angeles',
      ageRestriction: '18+',
      refundPolicy: 'No refunds or exchanges. Event is rain or shine.',
      organizerId: organizer1.id,
      venueId: createdVenues[2].id, // The Fillmore
      ticketTypes: [
        {
          name: 'General Admission',
          description: 'Standing room only, first come first served',
          price: 7500, // $75
          quantityTotal: 1000,
          maxPerOrder: 4,
        },
        {
          name: 'Balcony Reserved',
          description: 'Reserved balcony seating with bar service',
          price: 12500, // $125
          quantityTotal: 200,
          maxPerOrder: 2,
        },
      ],
    },
    {
      title: 'Chicago Cubs vs. Los Angeles Dodgers',
      shortDescription: 'MLB regular season game at Wrigley Field',
      description: 'Watch the Chicago Cubs take on the Los Angeles Dodgers in this exciting regular season matchup at historic Wrigley Field. Experience the tradition and excitement of America\'s pastime at one of baseball\'s most iconic venues. Game time: 1:20 PM. Gates open at 11:20 AM.',
      category: 'SPORTS',
      status: 'ON_SALE',
      startDate: new Date('2025-09-14T13:20:00-05:00'),
      endDate: new Date('2025-09-14T16:30:00-05:00'),
      doorsOpen: new Date('2025-09-14T11:20:00-05:00'),
      timezone: 'America/Chicago',
      ageRestriction: 'ALL_AGES',
      refundPolicy: 'Tickets are non-refundable. In case of rain delay or postponement, tickets will be honored for the rescheduled date.',
      organizerId: organizer2.id,
      venueId: createdVenues[3].id, // Wrigley Field
      ticketTypes: [
        {
          name: 'Bleachers',
          description: 'Outfield bleacher seating',
          price: 3500, // $35
          quantityTotal: 5000,
          maxPerOrder: 8,
        },
        {
          name: 'Upper Deck',
          description: 'Upper deck seating with great views',
          price: 5500, // $55
          quantityTotal: 12000,
          maxPerOrder: 8,
        },
        {
          name: 'Lower Deck',
          description: 'Lower deck seating closer to the field',
          price: 8500, // $85
          quantityTotal: 15000,
          maxPerOrder: 8,
        },
        {
          name: 'Club Level',
          description: 'Premium club level with access to exclusive lounges and dining',
          price: 15000, // $150
          quantityTotal: 3000,
          maxPerOrder: 6,
        },
      ],
    },
    {
      title: 'John Williams: Film Night at the Hollywood Bowl',
      shortDescription: 'An evening of iconic film scores conducted by John Williams',
      description: 'Experience the magic of cinema with legendary composer John Williams conducting the Los Angeles Philharmonic. This special evening features iconic scores from Star Wars, Harry Potter, Jurassic Park, E.T., and more. Bring a picnic and enjoy this unforgettable outdoor concert under the stars. Show starts at 8:00 PM.',
      category: 'CONCERT',
      status: 'ON_SALE',
      startDate: new Date('2025-07-04T20:00:00-07:00'),
      endDate: new Date('2025-07-04T22:30:00-07:00'),
      doorsOpen: new Date('2025-07-04T18:00:00-07:00'),
      timezone: 'America/Los_Angeles',
      ageRestriction: 'ALL_AGES',
      refundPolicy: 'Refunds available up to 24 hours before the event. No refunds for weather-related cancellations.',
      organizerId: organizer1.id,
      venueId: createdVenues[4].id, // Hollywood Bowl
      ticketTypes: [
        {
          name: 'Garden Box',
          description: 'Private garden box seating with table service',
          price: 25000, // $250
          quantityTotal: 100,
          maxPerOrder: 8,
        },
        {
          name: 'Pool Circle',
          description: 'Premium seating in the pool circle section',
          price: 17500, // $175
          quantityTotal: 500,
          maxPerOrder: 6,
        },
        {
          name: 'Terrace',
          description: 'Terrace level seating with excellent acoustics',
          price: 9500, // $95
          quantityTotal: 5000,
          maxPerOrder: 8,
        },
        {
          name: 'Bench Seating',
          description: 'Bench seating in the upper sections',
          price: 3500, // $35
          quantityTotal: 12000,
          maxPerOrder: 8,
        },
      ],
    },
    {
      title: 'TechCrunch Disrupt 2025',
      shortDescription: 'The world\'s leading technology innovation conference',
      description: 'Join thousands of entrepreneurs, investors, and tech leaders at TechCrunch Disrupt 2025. Features include startup pitch competitions, keynote speakers from top tech companies, networking events, and an expo hall showcasing the latest innovations. Three days of panels, workshops, and opportunities to connect with the tech community.',
      category: 'CONFERENCE',
      status: 'ON_SALE',
      startDate: new Date('2025-09-18T09:00:00-07:00'),
      endDate: new Date('2025-09-20T18:00:00-07:00'),
      doorsOpen: new Date('2025-09-18T08:00:00-07:00'),
      timezone: 'America/Los_Angeles',
      ageRestriction: 'ALL_AGES',
      refundPolicy: 'Full refunds available up to 30 days before the event. 50% refund between 30-14 days. No refunds within 14 days.',
      organizerId: organizer3.id,
      venueId: createdVenues[5].id, // Moscone Center
      ticketTypes: [
        {
          name: 'Early Bird Pass',
          description: 'Full 3-day access to all sessions, expo hall, and networking events. Includes lunch and coffee breaks.',
          price: 99900, // $999
          quantityTotal: 500,
          maxPerOrder: 5,
          saleStart: new Date('2025-01-01T00:00:00-07:00'),
          saleEnd: new Date('2025-06-01T23:59:59-07:00'),
        },
        {
          name: 'Regular Pass',
          description: 'Full 3-day access to all sessions, expo hall, and networking events',
          price: 149900, // $1,499
          quantityTotal: 3000,
          maxPerOrder: 5,
        },
        {
          name: 'Student Pass',
          description: 'Discounted 3-day pass for students with valid ID. Full access to all sessions.',
          price: 29900, // $299
          quantityTotal: 500,
          maxPerOrder: 2,
        },
        {
          name: 'VIP Pass',
          description: 'Includes all regular pass benefits plus VIP lounge access, reserved seating, exclusive networking dinner, and swag bag',
          price: 299900, // $2,999
          quantityTotal: 100,
          maxPerOrder: 2,
        },
      ],
    },
  ]

  for (const eventData of events) {
    const { ticketTypes, ...eventInfo } = eventData
    const event = await prisma.event.create({
      data: {
        ...eventInfo,
        ticketTypes: {
          create: ticketTypes,
        },
      },
    })
    console.log(`Created event: ${event.title}`)
  }

  // Create some promo codes
  const promoCodes = [
    {
      code: 'EARLYBIRD2025',
      eventId: events[5].venueId ? (await prisma.event.findFirst({ where: { title: 'TechCrunch Disrupt 2025' } }))?.id : null,
      discountType: 'PERCENTAGE',
      discountValue: 15, // 15% off
      usageLimit: 100,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-06-01'),
      minimumPurchase: 1,
    },
    {
      code: 'SUMMER25',
      discountType: 'FIXED_AMOUNT',
      discountValue: 2000, // $20 off
      usageLimit: 500,
      validFrom: new Date('2025-06-01'),
      validUntil: new Date('2025-08-31'),
      minimumPurchase: 5000, // Minimum $50 purchase
    },
  ]

  for (const promo of promoCodes) {
    await prisma.promoCode.create({
      data: promo,
    })
    console.log(`Created promo code: ${promo.code}`)
  }

  console.log('Seeding finished successfully!')
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
