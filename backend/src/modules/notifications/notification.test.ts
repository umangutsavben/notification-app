import request from 'supertest';
import express, { Express } from 'express';
import notificationRoutes from './notification.routes';
import prisma from '../../database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

let app: Express;
let testUserId: string;
let testAdminId: string;
let token: string;
let notificationId1: string;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  app.use('/api/v1/notifications', notificationRoutes);

  // Create test admin
  const admin = await prisma.admin.create({
    data: {
      email: 'test_admin_notif@example.com',
      password: 'hash',
      name: 'Admin',
    }
  });
  testAdminId = admin.id;

  // Create test user
  const user = await prisma.user.create({
    data: {
      phone: '+12345678903',
      phoneVerified: true,
      appwriteUserId: 'test_appwrite_id_notifs',
    }
  });
  testUserId = user.id;

  token = jwt.sign({ id: user.id, phone: user.phone }, env.JWT_SECRET, { expiresIn: '1h' });

  // Create test notification
  const notification1 = await prisma.notification.create({
    data: {
      title: 'Test Notification 1',
      body: 'This is a test',
      targetType: 'SPECIFIC_USERS',
      createdBy: testAdminId,
    }
  });
  
  const notification2 = await prisma.notification.create({
    data: {
      title: 'Test Notification 2',
      body: 'This is another test',
      targetType: 'SPECIFIC_USERS',
      createdBy: testAdminId,
    }
  });

  notificationId1 = notification1.id;

  // Link to user
  await prisma.userNotification.createMany({
    data: [
      { userId: testUserId, notificationId: notification1.id },
      { userId: testUserId, notificationId: notification2.id },
    ]
  });
});

afterAll(async () => {
  await prisma.userNotification.deleteMany({ where: { userId: testUserId } });
  await prisma.notification.deleteMany({ where: { createdBy: testAdminId } });
  await prisma.user.delete({ where: { id: testUserId } });
  await prisma.admin.delete({ where: { id: testAdminId } });
});

describe('Notification Routes', () => {
  it('should fetch user notifications with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/notifications?limit=1&offset=0')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.notifications.length).toBe(1);
    expect(response.body.pagination.total).toBe(2);
    expect(response.body.pagination.hasMore).toBe(true);
  });

  it('should fetch unread count', async () => {
    const response = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
  });

  it('should fetch single notification', async () => {
    const response = await request(app)
      .get(`/api/v1/notifications/${notificationId1}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.notificationId).toBe(notificationId1);
  });

  it('should mark a notification as read', async () => {
    const response = await request(app)
      .patch(`/api/v1/notifications/${notificationId1}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.isRead).toBe(true);
    
    // Check unread count decreased
    const countResponse = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    
    expect(countResponse.body.count).toBe(1);
  });

  it('should mark all notifications as read', async () => {
    const response = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.updatedCount).toBe(1); // 1 remaining unread

    const countResponse = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    
    expect(countResponse.body.count).toBe(0);
  });
});
