import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { DeviceService } from './device.service';
import createError from 'http-errors';
import { Platform } from '@prisma/client';

export const registerDevice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const { deviceId, platform, pushToken, appVersion } = req.body;

    if (!deviceId) {
      throw createError(400, 'deviceId is required');
    }

    if (!platform || !Object.values(Platform).includes(platform as Platform)) {
      throw createError(400, `platform is required and must be one of: ${Object.values(Platform).join(', ')}`);
    }

    const device = await DeviceService.registerDevice({
      userId,
      deviceId,
      platform,
      pushToken,
      appVersion,
    });

    res.status(201).json(device);
  } catch (error) {
    next(error);
  }
};

export const updateDevice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const deviceId = req.params.deviceId as string;
    const { pushToken, appVersion, isActive } = req.body;

    if (!deviceId) {
      throw createError(400, 'deviceId parameter is required');
    }

    const updatedDevice = await DeviceService.updateDevice({
      userId,
      deviceId,
      pushToken,
      appVersion,
      isActive,
    });

    if (!updatedDevice) {
      throw createError(404, 'Device not found or not owned by user');
    }

    res.json(updatedDevice);
  } catch (error) {
    next(error);
  }
};

export const deactivateDevice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const deviceId = req.params.deviceId as string;

    if (!deviceId) {
      throw createError(400, 'deviceId parameter is required');
    }

    const success = await DeviceService.deactivateDevice(userId, deviceId);

    if (!success) {
      throw createError(404, 'Device not found or not owned by user');
    }

    res.json({ message: 'Device deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
