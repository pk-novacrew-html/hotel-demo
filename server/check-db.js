const Database = require('better-sqlite3');
const db = new Database('./hotel.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', JSON.stringify(tables, null, 2));

// Check if bookings table exists and has data
const bookingsCount = db.prepare("SELECT COUNT(*) as count FROM bookings").get();
console.log('Bookings count:', bookingsCount);

const messagesCount = db.prepare("SELECT COUNT(*) as count FROM messages").get();
console.log('Messages count:', messagesCount);

db.close();
console.log('Done');
