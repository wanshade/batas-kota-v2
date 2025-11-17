import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
export const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']);
export const paymentTypeEnum = pgEnum('payment_type', ['FULL', 'DEPOSIT']);

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: roleEnum('role').default('USER'),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  phoneIdx: index('users_phone_idx').on(table.phone),
}));

// Fields table
export const fields = pgTable('fields', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  pricePerHour: integer('price_per_hour').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('fields_name_idx').on(table.name),
}));

// Bookings table
export const bookings = pgTable('bookings', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  fieldId: varchar('field_id', { length: 36 }).notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: bookingStatusEnum('status').default('PENDING'),
  paymentType: paymentTypeEnum('payment_type').notNull(),
  amountPaid: integer('amount_paid').notNull(),
  proofImageUrl: text('proof_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('bookings_user_id_idx').on(table.userId),
  fieldIdIdx: index('bookings_field_id_idx').on(table.fieldId),
  dateIdx: index('bookings_date_idx').on(table.date),
  statusIdx: index('bookings_status_idx').on(table.status),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const fieldsRelations = relations(fields, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  field: one(fields, {
    fields: [bookings.fieldId],
    references: [fields.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Field = typeof fields.$inferSelect;
export type NewField = typeof fields.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;