import { Router } from 'express';
import { z } from 'zod';
import { bookings, messages, rooms, roomTypes, customers } from '../db/schema';
import { db } from '../db';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '../middleware/admin';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendMail } from '../services/email';

const router = Router();
router.use(requireAdmin);

// Upload config
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// ===== ROOM TYPES =====
const createRoomTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().positive(),
  amenities: z.string().optional(),
  image: z.string().optional(),
});

const updateRoomTypeSchema = createRoomTypeSchema.partial();

router.get('/room-types', async (_req, res, next) => {
  try {
    const data = await db.select().from(roomTypes).orderBy(roomTypes.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/room-types/:id', async (req, res, next) => {
  try {
    const [row] = await db.select().from(roomTypes).where(eq(roomTypes.id, Number(req.params.id)));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ data: row });
  } catch (error) {
    next(error);
  }
});

router.post('/room-types', async (req, res, next) => {
  try {
    const body = createRoomTypeSchema.parse(req.body);
    const [row] = await db.insert(roomTypes).values(body).returning();
    res.status(201).json({ data: row });
  } catch (error) {
    next(error);
  }
});

router.patch('/room-types/:id', async (req, res, next) => {
  try {
    const body = updateRoomTypeSchema.parse(req.body);
    const [row] = await db.update(roomTypes).set(body).where(eq(roomTypes.id, Number(req.params.id))).returning();
    res.json({ data: row });
  } catch (error) {
    next(error);
  }
});

router.delete('/room-types/:id', async (req, res, next) => {
  try {
    await db.delete(roomTypes).where(eq(roomTypes.id, Number(req.params.id)));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/room-types/upload-image', upload.single('image'), (req, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'No image uploaded' });
  const imageUrl = `/uploads/${file.filename}`;
  res.json({ imageUrl });
});

// ===== ROOMS =====
const createRoomSchema = z.object({
  roomNumber: z.string().min(1),
  roomTypeId: z.coerce.number().int().positive(),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
});

const updateRoomSchema = createRoomSchema.partial();

router.get('/rooms', async (req, res, next) => {
  try {
    const data = await db.select().from(rooms).orderBy(rooms.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/rooms', async (req, res, next) => {
  try {
    const body = createRoomSchema.parse(req.body);
    const [row] = await db.insert(rooms).values(body).returning();
    res.status(201).json({ data: row });
  } catch (error) {
    next(error);
  }
});

router.patch('/rooms/:id', async (req, res, next) => {
  try {
    const body = updateRoomSchema.parse(req.body);
    const [row] = await db.update(rooms).set(body).where(eq(rooms.id, Number(req.params.id))).returning();
    res.json({ data: row });
  } catch (error) {
    next(error);
  }
});

router.delete('/rooms/:id', async (req, res, next) => {
  try {
    await db.delete(rooms).where(eq(rooms.id, Number(req.params.id)));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ===== CUSTOMERS =====
router.get('/customers', async (req, res, next) => {
  try {
    const data = await db.select().from(customers).orderBy(desc(customers.createdAt));
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/customers/:id', async (req, res, next) => {
  try {
    const [customer] = await db.select().from(customers).where(eq(customers.id, Number(req.params.id)));
    if (!customer) return res.status(404).json({ error: 'Not found' });

    const bookingHistory = await db.select().from(bookings).where(eq(bookings.email, customer.email)).orderBy(desc(bookings.createdAt));
    res.json({ data: customer, bookingHistory });
  } catch (error) {
    next(error);
  }
});

router.post('/customers', async (req, res, next) => {
  try {
    const body = z.object({ name: z.string().min(1), email: z.string().email(), phone: z.string().min(1), note: z.string().optional() }).parse(req.body);
    const [row] = await db.insert(customers).values(body).returning();
    res.status(201).json({ data: row });
  } catch (error) {
    next(error);
  }
});

router.patch('/customers/:id', async (req, res, next) => {
  try {
    const body = z.object({ name: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), note: z.string().optional() }).partial().parse(req.body);
    const [row] = await db.update(customers).set(body).where(eq(customers.id, Number(req.params.id))).returning();
    res.json({ data: row });
  } catch (error) {
    next(error);
  }
});

router.delete('/customers/:id', async (req, res, next) => {
  try {
    await db.delete(customers).where(eq(customers.id, Number(req.params.id)));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ===== BOOKINGS / MESSAGES (extend) =====
router.get('/bookings', async (req, res, next) => {
  try {
    const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.patch('/bookings/:id', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['pending', 'confirmed', 'cancelled']) }).parse(req.body);
    const [updated] = await db.update(bookings).set({ status }).where(eq(bookings.id, Number(req.params.id))).returning();
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.get('/messages', async (_req, res, next) => {
  try {
    const data = await db.select().from(messages).orderBy(desc(messages.createdAt));
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch('/messages/:id', async (_req, res, next) => {
  try {
    const [updated] = await db.update(messages).set({ read: true }).where(eq(messages.id, Number(req.params.id))).returning();
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

// ===== EMAIL TEST / NOTIFY =====
router.post('/notify/new-booking', async (req, res, next) => {
  try {
    const body = z.object({ id: z.number().int().positive(), name: z.string(), email: z.string(), roomType: z.string(), checkin: z.string(), checkout: z.string() }).parse(req.body);
    await sendMail({
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@example.com',
      subject: `Đặt phòng mới #${body.id}`,
      text: `Khách: ${body.name}\nEmail: ${body.email}\nPhòng: ${body.roomType}\nNhận: ${body.checkin}\nTrả: ${body.checkout}`,
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/notify/new-message', async (req, res, next) => {
  try {
    const body = z.object({ id: z.number().int().positive(), name: z.string(), email: z.string(), message: z.string() }).parse(req.body);
    await sendMail({
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@example.com',
      subject: `Tin nhắn mới #${body.id}`,
      text: `Người gửi: ${body.name}\nEmail: ${body.email}\nNội dung: ${body.message}`,
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
