-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "practiceBalanceCents" INTEGER NOT NULL DEFAULT 100000,
ADD COLUMN     "practiceReservedCents" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SettledPosition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "marketTitle" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "entryPriceCents" INTEGER NOT NULL,
    "exitPriceCents" INTEGER NOT NULL,
    "realizedPnLCents" INTEGER NOT NULL,
    "settledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettledPosition_pkey" PRIMARY KEY ("id")
);
