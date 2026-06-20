import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import { authRoutes } from './routes/auth';
import { requireAdmin } from './middleware/admin';
import { errorHandler } from './middleware/error';

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

// Test route first
app.get('/api/test', (req, res) => {
  console.log('GET /api/test called');
  res.json({ message: 'Test route works!' });
});

app.use('/api', publicRoutes);
console.log('Registered /api -> publicRoutes');

app.use('/api/admin', authRoutes);
console.log('Registered /api/admin/auth');

app.use('/api/admin', requireAdmin, adminRoutes);
console.log('Registered /api/admin (protected)');

// List routes
console.log('\nAll routes:');
if (app._router) {
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      console.log(`  ${Object.keys(middleware.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`  Router: ${middleware.regexp}`);
      middleware.handle?.stack?.forEach((handler: any) => {
        if (handler.route) {
          console.log(`    ${Object.keys(handler.methods).join(',').toUpperCase()} ${handler.route.path}`);
        } else {
          console.log(`    Middleware: ${handler.name || 'anonymous'}`);
        }
      });
    } else {
      console.log(`  Middleware: ${middleware.name || 'anonymous'}`);
    }
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((_req, res) => {
  console.log('404 for:', _req.path);
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\nServer running at http://localhost:${PORT}`);
});
