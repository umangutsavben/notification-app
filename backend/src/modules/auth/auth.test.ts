import request from 'supertest';
import app from '../../app';
import prisma from '../../database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

// Mock node-appwrite
jest.mock('node-appwrite', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      setEndpoint: jest.fn().mockReturnThis(),
      setProject: jest.fn().mockReturnThis(),
      setKey: jest.fn().mockReturnThis(),
      setJWT: jest.fn().mockReturnThis(),
    })),
    Account: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({
        $id: 'mock-appwrite-id',
        phone: '+919876543210',
        phoneVerification: true,
      }),
    })),
    Users: jest.fn(),
  };
});

describe('Auth Endpoints', () => {
  let mockAccessToken = '';
  
  beforeAll(async () => {
    // Clear test db or setup
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/exchange', () => {
    it('should exchange Appwrite session for local JWT and create new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/exchange')
        .send({ sessionToken: 'mock-appwrite-jwt' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.phone).toBe('+919876543210');
      mockAccessToken = res.body.accessToken;

      const userInDb = await prisma.user.findUnique({
        where: { appwriteUserId: 'mock-appwrite-id' },
      });
      expect(userInDb).not.toBeNull();
    });

    it('should reuse existing user on subsequent exchange', async () => {
      const res = await request(app)
        .post('/api/v1/auth/exchange')
        .send({ sessionToken: 'mock-appwrite-jwt' });

      expect(res.status).toBe(200);
      
      const count = await prisma.user.count({
        where: { appwriteUserId: 'mock-appwrite-id' },
      });
      expect(count).toBe(1); // No duplicate user created
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('should return user with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${mockAccessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.phone).toBe('+919876543210');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 200', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(200);
    });
  });
});
