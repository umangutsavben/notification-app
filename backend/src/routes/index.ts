import { Router, Request, Response } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import deviceRoutes from '../modules/devices/device.routes';
import notificationRoutes from '../modules/notifications/notification.routes';

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

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/notifications', notificationRoutes);
// router.use('/admin', adminRoutes);

export default router;
