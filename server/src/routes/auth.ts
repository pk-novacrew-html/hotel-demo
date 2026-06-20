import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { adminSessions } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export const authRoutes = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

authRoutes.post('/login', async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    await db.insert(adminSessions).values({ token, expiresAt });
    res.cookie('admin_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: 'lax' });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token as string | undefined;
    if (token) {
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
    }
    res.clearCookie('admin_token');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});