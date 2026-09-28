-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('PRIVATE', 'GROUP', 'ONLINE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('OPEN_PLAY', 'TOURNAMENT', 'SOCIAL', 'LESSON', 'OTHER');

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "cityId" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "beginnerFriendly" BOOLEAN NOT NULL DEFAULT false,
    "lessonsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "openPlay" BOOLEAN NOT NULL DEFAULT false,
    "socialPlay" BOOLEAN NOT NULL DEFAULT false,
    "womenOnly" BOOLEAN NOT NULL DEFAULT false,
    "free" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2),
    "schedule" TEXT,
    "sourceUrl" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "website" TEXT,
    "contact" TEXT,
    "lessonType" "LessonType"[],
    "privateLesson" BOOLEAN NOT NULL DEFAULT false,
    "groupLesson" BOOLEAN NOT NULL DEFAULT false,
    "onlineLesson" BOOLEAN NOT NULL DEFAULT false,
    "beginnerLesson" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2),
    "sourceUrl" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "venue" TEXT,
    "cityId" TEXT NOT NULL,
    "clubId" TEXT,
    "instructorId" TEXT,
    "eventType" "EventType" NOT NULL DEFAULT 'OTHER',
    "beginnerFriendly" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2),
    "registrationUrl" TEXT,
    "sourceUrl" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "affiliateUrl" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "beginnerPick" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_state_key" ON "City"("name", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");

-- CreateIndex
CREATE INDEX "Club_cityId_idx" ON "Club"("cityId");

-- CreateIndex
CREATE INDEX "Club_beginnerFriendly_idx" ON "Club"("beginnerFriendly");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_slug_key" ON "Instructor"("slug");

-- CreateIndex
CREATE INDEX "Instructor_cityId_idx" ON "Instructor"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_cityId_idx" ON "Event"("cityId");

-- CreateIndex
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
