ALTER TABLE "bookings" ADD COLUMN "nama_tim" varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "no_whatsapp" varchar(20);--> statement-breakpoint
CREATE INDEX "bookings_nama_tim_idx" ON "bookings" USING btree ("nama_tim");--> statement-breakpoint
CREATE INDEX "bookings_no_whatsapp_idx" ON "bookings" USING btree ("no_whatsapp");