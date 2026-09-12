import { Router } from 'express';
import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead
} from './notification.controller';
import { authenticateUser } from '../../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', getNotifications as any);
router.get('/unread', getUnreadNotifications as any);
router.get('/unread-count', getUnreadCount as any);
router.patch('/read-all', markAllAsRead as any);
router.get('/:id', getNotificationById as any);
router.patch('/:id/read', markAsRead as any);

export default router;
