import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import publicRoutes from './routes/public.ts';
import adminRoutes from './routes/admin.ts';
import { authRoutes } from './routes/auth.ts';
import { requireAdmin } from './middleware/admin.ts';
import { errorHandler } from './middleware/error.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = new Set(['http://localhost:3001', 'http://localhost:8080', 'http://127.0.0.1:8080']);

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Log all routes
console.log('Registering routes...');
console.log('Route: /api -> publicRoutes');
app.use('/api', publicRoutes);
console.log('Route: /api/admin/auth -> authRoutes');
app.use('/api/admin', authRoutes);
console.log('Route: /api/admin (protected) -> adminRoutes');
app.use('/api/admin', requireAdmin, adminRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Log all registered routes
console.log('Registered routes:');
app._router?.stack?.forEach((middleware: any) => {
  if (middleware.route) {
    console.log(`  ${Object.keys(middleware.methods).join(',').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle?.stack?.forEach((handler: any) => {
      if (handler.route) {
        console.log(`  ${Object.keys(handler.methods).join(',').toUpperCase()} ${handler.route.path}`);
      }
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
