import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dallas = await prisma.city.upsert({
    where: { slug: "dallas" },
    update: {},
    create: {
      name: "Dallas",
      state: "TX",
      slug: "dallas",
      published: true,
    },
  });

  await prisma.club.upsert({
    where: { slug: "dallas-beginner-mahjong-club" },
    update: {},
    create: {
      name: "Dallas Beginner Mahjong Club",
      slug: "dallas-beginner-mahjong-club",
      cityId: dallas.id,
      beginnerFriendly: true,
      lessonsAvailable: true,
      openPlay: true,
      schedule: "Saturdays, 1:00 PM",
      price: 20,
      status: "ACTIVE",
    },
  });

  await prisma.club.upsert({
    where: { slug: "dallas-social-mahjong" },
    update: {},
    create: {
      name: "Dallas Social Mahjong",
      slug: "dallas-social-mahjong",
      cityId: dallas.id,
      beginnerFriendly: true,
      free: true,
      schedule: "Sundays, 2:00 PM",
      status: "ACTIVE",
    },
  });

  await prisma.instructor.upsert({
    where: { slug: "jane-instructor-dallas" },
    update: {},
    create: {
      name: "Jane, Certified Instructor",
      slug: "jane-instructor-dallas",
      cityId: dallas.id,
      privateLesson: true,
      groupLesson: true,
      beginnerLesson: true,
      status: "ACTIVE",
    },
  });

  const eventDates = [
    new Date("2026-10-03"),
    new Date("2026-10-05"),
    new Date("2026-10-10"),
  ];

  for (const [index, eventDate] of eventDates.entries()) {
    await prisma.event.upsert({
      where: { slug: `dallas-beginner-open-play-${index}` },
      update: {},
      create: {
        name: "Beginner Open Play",
        slug: `dallas-beginner-open-play-${index}`,
        eventDate,
        cityId: dallas.id,
        eventType: "OPEN_PLAY",
        beginnerFriendly: true,
        status: "ACTIVE",
      },
    });
  }

  await prisma.product.upsert({
    where: { slug: "beginner-mahjong-set" },
    update: {},
    create: {
      name: "Beginner American Mahjong Set (166 Tiles)",
      slug: "beginner-mahjong-set",
      category: "Mahjong Sets",
      description:
        "A complete 166-tile set with racks, recommended for first-time buyers.",
      affiliateUrl: "#",
      beginnerPick: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "current-year-scoring-card" },
    update: {},
    create: {
      name: "Current Year Scoring Card",
      slug: "current-year-scoring-card",
      category: "Cards",
      description: "The official National Mah Jongg League scoring card.",
      affiliateUrl: "#",
      beginnerPick: true,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
