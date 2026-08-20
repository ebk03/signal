CREATE TABLE "job_postings" (
	"id" serial PRIMARY KEY NOT NULL,
	"hn_item_id" integer NOT NULL,
	"hn_thread_id" integer NOT NULL,
	"company" text,
	"role" text,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"location" text,
	"remote" boolean DEFAULT false NOT NULL,
	"raw_text" text NOT NULL,
	"posted_at" timestamp with time zone,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_postings_hn_item_id_unique" UNIQUE("hn_item_id")
);
