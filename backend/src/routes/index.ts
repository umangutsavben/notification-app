import { Router, Request, Response } from 'express';

const router = Router();

// Health Check Endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Mount other route modules here
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/admin', adminRoutes);

export default router;
