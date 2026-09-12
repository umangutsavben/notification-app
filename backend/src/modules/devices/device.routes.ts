import { Router } from 'express';
import { registerDevice, updateDevice, deactivateDevice } from './device.controller';
import { authenticateUser } from '../../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.post('/', registerDevice as any);
router.patch('/:deviceId', updateDevice as any);
router.delete('/:deviceId', deactivateDevice as any);

export default router;
