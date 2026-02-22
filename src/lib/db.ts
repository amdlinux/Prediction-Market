// src/lib/db.ts
import { PrismaClient } from '@prisma/client'
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

export const adapter = new PrismaNeon({connectionString: process.env.DATABASE_URL!});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ?? new PrismaClient({
    adapter
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}