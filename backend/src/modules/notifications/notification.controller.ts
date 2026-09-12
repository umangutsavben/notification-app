import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { NotificationService } from './notification.service';
import createError from 'http-errors';

export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await NotificationService.getUserNotifications(userId, limit, offset);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await NotificationService.getUnreadNotifications(userId, limit, offset);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const result = await NotificationService.getUnreadCount(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getNotificationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const id = req.params.id as string;
    if (!id) {
      throw createError(400, 'Notification ID is required');
    }

    const notification = await NotificationService.getNotificationById(userId, id);
    if (!notification) {
      throw createError(404, 'Notification not found');
    }

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const id = req.params.id as string;
    if (!id) {
      throw createError(400, 'Notification ID is required');
    }

    const notification = await NotificationService.markAsRead(userId, id);
    if (!notification) {
      throw createError(404, 'Notification not found');
    }

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(401, 'Unauthorized');
    }

    const result = await NotificationService.markAllAsRead(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
