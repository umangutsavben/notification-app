import prisma from '../../database';

export class NotificationService {
  static async getUserNotifications(userId: string, limit: number, offset: number) {
    const [notifications, total] = await Promise.all([
      prisma.userNotification.findMany({
        where: { userId },
        include: { notification: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userNotification.count({
        where: { userId },
      })
    ]);

    return {
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + notifications.length < total
      }
    };
  }

  static async getUnreadNotifications(userId: string, limit: number, offset: number) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.userNotification.findMany({
        where: { userId, isRead: false },
        include: { notification: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userNotification.count({
        where: { userId, isRead: false },
      })
    ]);

    return {
      unreadCount,
      notifications,
      pagination: {
        total: unreadCount,
        limit,
        offset,
        hasMore: offset + notifications.length < unreadCount
      }
    };
  }

  static async getUnreadCount(userId: string) {
    const count = await prisma.userNotification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  static async getNotificationById(userId: string, notificationId: string) {
    const userNotification = await prisma.userNotification.findUnique({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        }
      },
      include: { notification: true }
    });

    return userNotification;
  }

  static async markAsRead(userId: string, notificationId: string) {
    const userNotification = await prisma.userNotification.findUnique({
      where: { userId_notificationId: { userId, notificationId } }
    });

    if (!userNotification) {
      return null;
    }

    if (userNotification.isRead) {
      return userNotification; // Idempotent
    }

    return await prisma.userNotification.update({
      where: { id: userNotification.id },
      data: { isRead: true, readAt: new Date() },
      include: { notification: true }
    });
  }

  static async markAllAsRead(userId: string) {
    const result = await prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { updatedCount: result.count };
  }
}
