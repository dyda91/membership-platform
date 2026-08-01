-- DropForeignKey
ALTER TABLE "Tier" DROP CONSTRAINT IF EXISTS "Tier_artistId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Tier_artistId_name_key";

-- DropColumn
ALTER TABLE "Tier" DROP COLUMN IF EXISTS "artistId",
DROP COLUMN IF EXISTS "price",
DROP COLUMN IF EXISTS "active";

-- AlterTable
ALTER TABLE "Tier" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "tierId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tier_name_key" ON "Tier"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
