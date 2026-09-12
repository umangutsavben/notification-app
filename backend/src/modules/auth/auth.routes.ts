import { Router } from 'express';
import { exchange, me, logout } from './auth.controller';
import { authenticateUser } from '../../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints (prevent brute force abuse)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' }
});

router.post('/exchange', authLimiter, exchange);
router.post('/logout', logout);
router.get('/me', authenticateUser, me);

export default router;
