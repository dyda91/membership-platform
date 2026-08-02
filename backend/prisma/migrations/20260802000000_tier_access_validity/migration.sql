-- CreateEnum
CREATE TYPE "TierAccessAction" AS ENUM ('GRANTED', 'RENEWED', 'TIER_CHANGED', 'DATES_CHANGED', 'REVOKED', 'RESTORED', 'MIGRATED');

-- CreateTable
CREATE TABLE "TierAccessAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TierAccessAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TierAccessEvent" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "TierAccessAction" NOT NULL,
    "previousTierId" TEXT,
    "newTierId" TEXT,
    "previousStartsAt" TIMESTAMP(3),
    "newStartsAt" TIMESTAMP(3),
    "previousExpiresAt" TIMESTAMP(3),
    "newExpiresAt" TIMESTAMP(3),
    "actorId" TEXT,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TierAccessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TierAccessAssignment_userId_key" ON "TierAccessAssignment"("userId");

-- CreateIndex
CREATE INDEX "TierAccessAssignment_tierId_idx" ON "TierAccessAssignment"("tierId");

-- CreateIndex
CREATE INDEX "TierAccessAssignment_startsAt_idx" ON "TierAccessAssignment"("startsAt");

-- CreateIndex
CREATE INDEX "TierAccessAssignment_expiresAt_idx" ON "TierAccessAssignment"("expiresAt");

-- CreateIndex
CREATE INDEX "TierAccessEvent_userId_idx" ON "TierAccessEvent"("userId");

-- CreateIndex
CREATE INDEX "TierAccessEvent_assignmentId_idx" ON "TierAccessEvent"("assignmentId");

-- CreateIndex
CREATE INDEX "TierAccessEvent_createdAt_idx" ON "TierAccessEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "TierAccessAssignment" ADD CONSTRAINT "TierAccessAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessAssignment" ADD CONSTRAINT "TierAccessAssignment_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessAssignment" ADD CONSTRAINT "TierAccessAssignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessAssignment" ADD CONSTRAINT "TierAccessAssignment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessAssignment" ADD CONSTRAINT "TierAccessAssignment_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessEvent" ADD CONSTRAINT "TierAccessEvent_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TierAccessAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessEvent" ADD CONSTRAINT "TierAccessEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessEvent" ADD CONSTRAINT "TierAccessEvent_previousTierId_fkey" FOREIGN KEY ("previousTierId") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessEvent" ADD CONSTRAINT "TierAccessEvent_newTierId_fkey" FOREIGN KEY ("newTierId") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierAccessEvent" ADD CONSTRAINT "TierAccessEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing explicit tier assignments into permanent access records.
INSERT INTO "TierAccessAssignment" ("id", "userId", "tierId", "startsAt", "expiresAt", "createdById", "updatedById", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "User"."id", "User"."tierId", COALESCE("User"."createdAt", now()), NULL, "User"."id", "User"."id", now(), now()
FROM "User"
WHERE "User"."tierId" IS NOT NULL;

INSERT INTO "TierAccessEvent" ("id", "assignmentId", "userId", "action", "newTierId", "newStartsAt", "actorId", "createdAt")
SELECT gen_random_uuid()::text, "TierAccessAssignment"."id", "TierAccessAssignment"."userId", 'MIGRATED', "TierAccessAssignment"."tierId", "TierAccessAssignment"."startsAt", "TierAccessAssignment"."userId", now()
FROM "TierAccessAssignment";
