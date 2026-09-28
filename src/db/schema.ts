import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Drizzle schema for the American Mahjong discovery platform, targeting
// Cloudflare D1 (SQLite). Models follow the data strategy in the business
// plan (section 12): City / Club / Instructor / Event / Product, each with
// verification metadata (sourceUrl, lastVerifiedAt, status) so data
// freshness can be tracked.

export type RecordStatus = "ACTIVE" | "INACTIVE" | "NEEDS_REVIEW";
export type EventType =
  | "OPEN_PLAY"
  | "TOURNAMENT"
  | "SOCIAL"
  | "LESSON"
  | "OTHER";

/** A city landing page (e.g. "American Mahjong in Dallas"). */
export const cities = sqliteTable(
  "City",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    state: text("state").notNull(),
    slug: text("slug").notNull().unique(),
    latitude: real("latitude"),
    longitude: real("longitude"),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("City_name_state_key").on(table.name, table.state)],
);

export const clubs = sqliteTable(
  "Club",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    cityId: text("cityId")
      .notNull()
      .references(() => cities.id),
    address: text("address"),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    beginnerFriendly: integer("beginnerFriendly", { mode: "boolean" })
      .notNull()
      .default(false),
    lessonsAvailable: integer("lessonsAvailable", { mode: "boolean" })
      .notNull()
      .default(false),
    openPlay: integer("openPlay", { mode: "boolean" }).notNull().default(false),
    socialPlay: integer("socialPlay", { mode: "boolean" })
      .notNull()
      .default(false),
    womenOnly: integer("womenOnly", { mode: "boolean" })
      .notNull()
      .default(false),
    free: integer("free", { mode: "boolean" }).notNull().default(false),
    price: real("price"),
    schedule: text("schedule"),
    sourceUrl: text("sourceUrl"),
    lastVerifiedAt: text("lastVerifiedAt"),
    status: text("status").notNull().default("NEEDS_REVIEW").$type<RecordStatus>(),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("Club_cityId_idx").on(table.cityId),
    index("Club_beginnerFriendly_idx").on(table.beginnerFriendly),
  ],
);

export const instructors = sqliteTable(
  "Instructor",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    cityId: text("cityId")
      .notNull()
      .references(() => cities.id),
    website: text("website"),
    contact: text("contact"),
    privateLesson: integer("privateLesson", { mode: "boolean" })
      .notNull()
      .default(false),
    groupLesson: integer("groupLesson", { mode: "boolean" })
      .notNull()
      .default(false),
    onlineLesson: integer("onlineLesson", { mode: "boolean" })
      .notNull()
      .default(false),
    beginnerLesson: integer("beginnerLesson", { mode: "boolean" })
      .notNull()
      .default(false),
    price: real("price"),
    sourceUrl: text("sourceUrl"),
    lastVerifiedAt: text("lastVerifiedAt"),
    status: text("status").notNull().default("NEEDS_REVIEW").$type<RecordStatus>(),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("Instructor_cityId_idx").on(table.cityId)],
);

export const events = sqliteTable(
  "Event",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    eventDate: text("eventDate").notNull(),
    startTime: text("startTime"),
    endTime: text("endTime"),
    venue: text("venue"),
    cityId: text("cityId")
      .notNull()
      .references(() => cities.id),
    clubId: text("clubId").references(() => clubs.id),
    instructorId: text("instructorId").references(() => instructors.id),
    eventType: text("eventType").notNull().default("OTHER").$type<EventType>(),
    beginnerFriendly: integer("beginnerFriendly", { mode: "boolean" })
      .notNull()
      .default(false),
    price: real("price"),
    registrationUrl: text("registrationUrl"),
    sourceUrl: text("sourceUrl"),
    lastVerifiedAt: text("lastVerifiedAt"),
    status: text("status").notNull().default("NEEDS_REVIEW").$type<RecordStatus>(),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("Event_cityId_idx").on(table.cityId),
    index("Event_eventDate_idx").on(table.eventDate),
  ],
);

/** Curated affiliate product recommendations for the Shop section. */
export const products = sqliteTable(
  "Product",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    affiliateUrl: text("affiliateUrl").notNull(),
    price: real("price"),
    beginnerPick: integer("beginnerPick", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("Product_category_idx").on(table.category)],
);
