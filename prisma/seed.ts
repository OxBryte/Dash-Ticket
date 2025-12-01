import { Event, PrismaClient, TicketType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding with real data...");

  // Create Real Organizers

    {
      name: "The Fillmore",
      address: "1805 Geary Blvd",
      city: "San Francisco",
      state: "CA",
      zip: "94115",
      country: "USA",
      capacity: 1200,
      latitude: 37.7849,
      longitude: -122.4324,
      description:
        "Historic music venue in the heart of San Francisco. Known for intimate performances and legendary acoustics.",
    },
    {
      name: "Wrigley Field",
      address: "1060 W Addison St",
      city: "Chicago",
      state: "IL",
      zip: "60613",
      country: "USA",
      capacity: 41649,
      latitude: 41.9484,
      longitude: -87.6553,
      description:
        "Historic baseball stadium and concert venue. Home of the Chicago Cubs since 1914.",
    },
    {
      name: "The Hollywood Bowl",
      address: "2301 N Highland Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90068",
      country: "USA",
      capacity: 17500,
      latitude: 34.1123,
      longitude: -118.3389,
      description:
        "Iconic outdoor amphitheater in the Hollywood Hills. Hosts world-class concerts and events year-round.",
    },
    {
      name: "Moscone Center",
      address: "747 Howard St",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "USA",
      capacity: 20000,
      latitude: 37.7849,
      longitude: -122.4008,
      description:
        "Premier convention center in downtown San Francisco. Hosts major tech conferences and trade shows.",
    },
  ];

  const createdVenues = [];
  for (const venue of venues) {
    // Check if venue exists by name and address
    const existing = await prisma.venue.findFirst({
      where: {
        name: venue.name,
        address: venue.address,
      },
    });

    const v =
      existing ||
      (await prisma.venue.create({
        data: venue,
      }));
    createdVenues.push(v);
  }

  console.log(`Created ${createdVenues.length} venues`);

  // Create Real Events
  const events: Event[] = [];

  for (const eventData of events) {
    const { ticketTypes, ...eventInfo } = eventData as Event & { ticketTypes: TicketType[] };
    const event = await prisma.event.create({
      data: {
        ...eventInfo,
        ticketTypes: {
          create: ticketTypes,
        },
      },
    });
    console.log(`Created event: ${event.title}`);
  }

  // Create some promo codes
  const techEvent = await prisma.event.findFirst({
    where: { title: "TechCrunch Disrupt 2025" },
  });

  const promoCodes = [
    {
      code: "EARLYBIRD2025",
      eventId: techEvent?.id || null,
      discountType: "PERCENTAGE",
      discountValue: 15, // 15% off
      usageLimit: 100,
      validFrom: new Date("2025-01-01"),
      validUntil: new Date("2025-06-01"),
      minimumPurchase: 1,
    },
    {
      code: "SUMMER25",
      discountType: "FIXED_AMOUNT",
      discountValue: 2000, // $20 off
      usageLimit: 500,
      validFrom: new Date("2025-06-01"),
      validUntil: new Date("2025-08-31"),
      minimumPurchase: 5000, // Minimum $50 purchase
    },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.create({
      data: promo,
    });
    console.log(`Created promo code: ${promo.code}`);
  }

  console.log("Seeding finished successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
