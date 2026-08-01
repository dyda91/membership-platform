-- AlterEnum
ALTER TYPE "Role" RENAME VALUE 'ADMIN' TO 'SUPER_ADMIN';

-- AlterEnum
ALTER TYPE "PostStatus" ADD VALUE 'ARCHIVED';

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_artistId_fkey";

-- DropIndex
DROP INDEX "Post_artistId_idx";

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "bannerUrl" TEXT,
ADD COLUMN "bio" TEXT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "artistId",
DROP COLUMN "textContent",
ADD COLUMN "authorId" TEXT NOT NULL,
ADD COLUMN "content" TEXT NOT NULL,
ADD COLUMN "coverMediaId" TEXT,
ADD COLUMN "tierId" TEXT,
ADD COLUMN "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "url",
ADD COLUMN "duration" INTEGER,
ADD COLUMN "filename" TEXT NOT NULL,
ADD COLUMN "height" INTEGER,
ADD COLUMN "mimeType" TEXT NOT NULL,
ADD COLUMN "originalName" TEXT NOT NULL,
ADD COLUMN "size" INTEGER NOT NULL,
ADD COLUMN "storageKey" TEXT NOT NULL,
ADD COLUMN "width" INTEGER,
ALTER COLUMN "postId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_coverMediaId_key" ON "Post"("coverMediaId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_tierId_idx" ON "Post"("tierId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
