-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_coverMediaId_fkey";

-- DropIndex
DROP INDEX "Post_coverMediaId_key";

-- DropColumn
ALTER TABLE "Post" DROP COLUMN "coverMediaId";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;
