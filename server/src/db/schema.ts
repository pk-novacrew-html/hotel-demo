import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  checkin: text('checkin').notNull(),
  checkout: text('checkout').notNull(),
  guests: integer('guests').notNull(),
  roomType: text('room_type').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] }).notNull().default('pending'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const adminSessions = sqliteTable('admin_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const roomTypes = sqliteTable('room_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  price: integer('price').notNull(),
  capacity: integer('capacity').notNull(),
  amenities: text('amenities').notNull().default(''),
  image: text('image'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomNumber: text('room_number').notNull().unique(),
  roomTypeId: integer('room_type_id').notNull().references(() => roomTypes.id),
  status: text('status', { enum: ['available', 'occupied', 'maintenance'] }).notNull().default('available'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});