-- AlterTable
ALTER TABLE "Artist"
ADD COLUMN "presentationText" TEXT,
ADD COLUMN "avatarMediaId" TEXT,
ADD COLUMN "bannerMediaId" TEXT,
ADD COLUMN "whatsappValue" TEXT,
ADD COLUMN "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "discordUrl" TEXT,
ADD COLUMN "discordEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "contactButtonText" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Artist_avatarMediaId_key" ON "Artist"("avatarMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_bannerMediaId_key" ON "Artist"("bannerMediaId");

-- Enforce at most one active ARTIST role row
CREATE UNIQUE INDEX "UserRole_single_active_artist" ON "UserRole"("role") WHERE "role" = 'ARTIST';

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_avatarMediaId_fkey" FOREIGN KEY ("avatarMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_bannerMediaId_fkey" FOREIGN KEY ("bannerMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
