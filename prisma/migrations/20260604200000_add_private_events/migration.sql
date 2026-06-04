-- Add isPrivate with default false
ALTER TABLE "Event" ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- Add shareToken as nullable first, populate, then make unique + not null
ALTER TABLE "Event" ADD COLUMN "shareToken" TEXT;
UPDATE "Event" SET "shareToken" = gen_random_uuid()::text WHERE "shareToken" IS NULL;
ALTER TABLE "Event" ALTER COLUMN "shareToken" SET NOT NULL;
ALTER TABLE "Event" ADD CONSTRAINT "Event_shareToken_key" UNIQUE ("shareToken");
