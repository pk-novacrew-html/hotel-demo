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

// Import routes
console.log('Importing publicRoutes...');
import publicRoutes from './routes/public.js';
console.log('publicRoutes type:', typeof publicRoutes);
console.log('publicRoutes:', publicRoutes);
console.log('publicRoutes.stack:', publicRoutes?.stack);
console.log('publicRoutes.stack length:', publicRoutes?.stack?.length);

if (publicRoutes && publicRoutes.stack) {
  console.log('\nPublicRoutes routes:');
  publicRoutes.stack.forEach((middleware: any) => {
    if (middleware.route) {
      console.log(`  ${Object.keys(middleware.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`  Router:`);
      middleware.handle?.stack?.forEach((handler: any) => {
        if (handler.route) {
          console.log(`    ${Object.keys(handler.methods).join(',').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  });
}

app.use('/api', publicRoutes);
console.log('\nRegistered /api -> publicRoutes');

// List all routes
console.log('\nAll app routes:');
if (app._router) {
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      console.log(`  ${Object.keys(middleware.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`  Router middleware:`);
      middleware.handle?.stack?.forEach((handler: any) => {
        if (handler.route) {
          console.log(`    ${Object.keys(handler.methods).join(',').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`\nServer running at http://localhost:${PORT}`);
});
