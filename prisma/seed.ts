import { Event, PrismaClient, TicketType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding with real data...")


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
