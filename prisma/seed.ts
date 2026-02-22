// prisma/seed.ts
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";

export const adapter = new PrismaNeon({connectionString: process.env.DATABASE_URL!});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const markets = [
    {
      title: 'Will Bitcoin exceed $120,000 before December 31, 2025?',
      category: 'Crypto',
      closingDate: new Date('2025-12-31'),
    },
    {
      title: 'Will the Fed cut interest rates in Q3 2025?',
      category: 'Economics',
      closingDate: new Date('2025-09-30'),
    },
    {
      title: 'Will Apple release a foldable iPhone in 2025?',
      category: 'Technology',
      closingDate: new Date('2025-12-31'),
    },
    {
      title: 'Will India win the ICC Cricket World Cup 2025?',
      category: 'Sports',
      closingDate: new Date('2025-11-30'),
    },
    {
      title: 'Will Tesla stock be above $300 by end of 2025?',
      category: 'Stocks',
      closingDate: new Date('2025-12-31'),
    },
  ]

  for (const market of markets) {
    await prisma.market.upsert({
      where: { id: market.title }, // hacky but fine for seeding
      update: {},
      create: market,
    })
  }

  console.log('✅ Markets seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());