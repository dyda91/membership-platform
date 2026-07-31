-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- AlterEnum
ALTER TYPE "Role" RENAME VALUE 'USER' TO 'SUBSCRIBER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT,
ADD COLUMN "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","role")
);

-- Backfill: migrate existing single role values to the relationship table
INSERT INTO "UserRole" ("userId", "role")
SELECT "id", "role" FROM "User";

-- DropColumn
ALTER TABLE "User" DROP COLUMN "role";

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
