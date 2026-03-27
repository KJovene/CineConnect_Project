ALTER TABLE "films" ADD COLUMN "type" varchar(20);--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "genre" varchar(255);--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "plot" text;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "runtime" varchar(20);--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "omdb_rating" varchar(10);--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "awards" text;--> statement-breakpoint
ALTER TABLE "films" ADD CONSTRAINT "films_omdb_id_unique" UNIQUE("omdb_id");