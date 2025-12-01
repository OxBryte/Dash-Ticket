import { Event, PrismaClient, TicketType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding with real data...")

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
