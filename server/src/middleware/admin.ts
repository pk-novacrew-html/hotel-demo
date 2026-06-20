import { Request, Response, NextFunction } from 'express';
import { adminSessions } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.admin_token as string | undefined;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const session = await db.select().from(adminSessions).where(eq(adminSessions.token, token)).limit(1);
    if (!session.length || new Date(session[0].expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    (req as any).admin = { username: process.env.ADMIN_USERNAME };
    next();
  } catch (error) {
    console.error('[AUTH ERROR]', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}