import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  hnItemId: integer("hn_item_id").notNull().unique(),
  hnThreadId: integer("hn_thread_id").notNull(),
  company: text("company"),
  role: text("role"),
  skills: text("skills").array().notNull().default([]),
  location: text("location"),
  remote: boolean("remote").notNull().default(false),
  rawText: text("raw_text").notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
});
