import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import createError from 'http-errors';
import apiRoutes from './routes';

const app: Express = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting Placeholder
// TODO: Implement Redis-based rate limiting

// API Routes
app.use('/api/v1', apiRoutes);

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404, 'Endpoint not found'));
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      // Don't expose stack traces in production
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

export default app;
