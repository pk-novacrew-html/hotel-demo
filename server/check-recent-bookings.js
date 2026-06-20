const Database = require('better-sqlite3');
const db = new Database('./hotel.db');
const bookings = db.prepare("SELECT * FROM bookings ORDER BY id DESC LIMIT 5").all();
console.log('Recent bookings:');
console.log(JSON.stringify(bookings, null, 2));
db.close();
