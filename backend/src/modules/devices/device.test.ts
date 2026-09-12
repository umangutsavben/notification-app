import request from 'supertest';
import express, { Express } from 'express';
import deviceRoutes from './device.routes';
import prisma from '../../database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

let app: Express;
let testUserId: string;
let token: string;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  app.use('/api/v1/devices', deviceRoutes);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      phone: '+12345678902',
      phoneVerified: true,
      appwriteUserId: 'test_appwrite_id_devices',
    }
  });
  testUserId = user.id;

  // Generate valid JWT
  token = jwt.sign({ id: user.id, phone: user.phone }, env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.device.deleteMany({ where: { userId: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });
});

describe('Device Routes', () => {
  const deviceId = 'test-device-123';

  it('should register a new device', async () => {
    const response = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deviceId,
        platform: 'ANDROID',
        appVersion: '1.0.0',
        pushToken: 'push-token-123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.deviceId).toBe(deviceId);
    expect(response.body.platform).toBe('ANDROID');
    expect(response.body.isActive).toBe(true);
  });

  it('should update an existing device on re-registration', async () => {
    const response = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deviceId,
        platform: 'ANDROID',
        appVersion: '1.0.1',
        pushToken: 'push-token-456',
      });

    expect(response.status).toBe(201);
    expect(response.body.appVersion).toBe('1.0.1');
    expect(response.body.pushToken).toBe('push-token-456');
  });

  it('should update specific device fields', async () => {
    const response = await request(app)
      .patch(`/api/v1/devices/${deviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        pushToken: 'push-token-789',
      });

    expect(response.status).toBe(200);
    expect(response.body.pushToken).toBe('push-token-789');
  });

  it('should deactivate a device', async () => {
    const response = await request(app)
      .delete(`/api/v1/devices/${deviceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    const device = await prisma.device.findUnique({
      where: { userId_deviceId: { userId: testUserId, deviceId } }
    });
    expect(device?.isActive).toBe(false);
  });

  it('should return 401 if unauthorized', async () => {
    const response = await request(app)
      .post('/api/v1/devices')
      .send({
        deviceId: 'other-device',
        platform: 'IOS',
      });

    expect(response.status).toBe(401);
  });
});
