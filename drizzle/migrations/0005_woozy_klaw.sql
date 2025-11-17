-- Add unique constraint to phone field
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");