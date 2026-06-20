import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './src/db/schema.js';

const database = new Database('./hotel.db');
const db = drizzle(database, { schema });

console.log('Drizzle initialized');

try {
  const bookings = db.select().from(schema.bookings).all();
  console.log('Bookings:', bookings.length);
  console.log('First booking:', JSON.stringify(bookings[0]));
} catch (e) {
  console.error('Error querying bookings:', e);
}

database.close();
console.log('Done');
