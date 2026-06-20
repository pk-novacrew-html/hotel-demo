import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body === undefined || req.body === null) {
        return res.status(400).json({ error: 'Request body is required' });
      }
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      next(error);
    }
  };
}

export function requireJsonBody(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    if (req.body === undefined) {
      return res.status(400).json({ error: 'Request body is required' });
    }
  }
  next();
}