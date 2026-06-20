import { Router } from 'express';
import { z } from 'zod';
import { bookings, messages } from '../db/schema';
import { db } from '../db';

const router = Router();

const createBookingSchema = z.object({
  checkin: z.string().min(1),
  checkout: z.string().min(1),
  guests: z.number().int().min(1),
  roomType: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  notes: z.string().optional(),
});

router.post('/bookings', async (req, res, next) => {
  try {
    const data = createBookingSchema.parse(req.body);
    const result = await db.insert(bookings).values(data).returning();
    res.status(201).json({ success: true, id: result[0].id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Thiếu thông tin hoặc dữ liệu không hợp lệ.', issues: error.issues });
    }
    next(error);
  }
});

const createMessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

router.post('/messages', async (req, res, next) => {
  try {
    const data = createMessageSchema.parse(req.body);
    const result = await db.insert(messages).values(data).returning();
    res.status(201).json({ success: true, id: result[0].id });
  } catch (error) {
    next(error);
  }
});

export default router;