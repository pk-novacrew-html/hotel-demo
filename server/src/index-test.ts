import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

console.log('Testing simple booking route...');

// Simple booking route
app.post('/api/bookings', async (req, res) => {
  console.log('POST /api/bookings called');
  console.log('Body:', req.body);
  
  try {
    // Import database
    const Database = (await import('better-sqlite3')).default;
    console.log('Database imported');
    
    const database = new Database('./hotel.db');
    console.log('Database opened');
    
    const { name, email, checkin, checkout, guests, roomType, phone, notes } = req.body;
    
    const stmt = database.prepare(`
      INSERT INTO bookings (checkin, checkout, guests, room_type, name, email, phone, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `);
    
    const result = stmt.run(checkin, checkout, guests, roomType, name, email, phone, notes || '');
    console.log('Insert result:', result);
    
    database.close();
    console.log('Database closed');
    
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create booking', details: (error as Error).message });
  }
});

app.get('/api/bookings', (req, res) => {
  console.log('GET /api/bookings called');
  res.json({ message: 'GET not implemented - this is expected' });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
