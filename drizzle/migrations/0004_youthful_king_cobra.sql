ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");