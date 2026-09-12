import { Request, Response, NextFunction } from 'express';
import { Client, Users, Account } from 'node-appwrite';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import prisma from '../../database';
import { env } from '../../config/env';
import { AuthenticatedRequest } from '../../middleware/auth';

export const exchange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken) {
      throw createError(400, 'Appwrite sessionToken is required');
    }

    // 1. Initialize Appwrite Client with Server Credentials
    const client = new Client()
      .setEndpoint(env.APPWRITE_ENDPOINT)
      .setProject(env.APPWRITE_PROJECT_ID)
      .setKey(env.APPWRITE_API_KEY);

    const appwriteUsers = new Users(client);

    // To verify the token, the typical approach with Appwrite server SDK is to 
    // validate it, or you can use the Appwrite JWT endpoint. Since the client 
    // provides a JWT (via account.createJWT()), we can verify it here.
    // However, if the client sends a `sessionToken`, the most robust server-side 
    // verification is to initialize a client WITH that session (if using client SDK) 
    // or use the JWT approach. We assume the client calls `account.createJWT()` and passes `jwt`.
    // For clarity, we'll expect `sessionToken` to actually be the Appwrite JWT.
    
    // We will use the Appwrite Client initialized with the JWT to get the user context.
    const userClient = new Client()
      .setEndpoint(env.APPWRITE_ENDPOINT)
      .setProject(env.APPWRITE_PROJECT_ID)
      .setJWT(sessionToken); // The Flutter client must send the result of account.createJWT()

    // We can't use Users API with JWT directly, we use Account API. 
    // But since node-appwrite is a server SDK, it uses API keys. 
    // Wait, the standard way is to use Account from node-appwrite with the JWT client.
    // Node-appwrite v11+ supports Account API with JWT for acting on behalf of a user.
    const account = new Account(userClient);
    
    let appwriteUser;
    try {
      appwriteUser = await account.get();
    } catch (err) {
      throw createError(401, 'Invalid Appwrite credentials');
    }

    const { $id: appwriteUserId, phone, phoneVerification } = appwriteUser;

    if (!phone) {
      throw createError(400, 'Appwrite account does not have a phone number attached');
    }

    // 2. Upsert PostgreSQL User
    let user = await prisma.user.findUnique({
      where: { appwriteUserId },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { appwriteUserId },
        data: { 
          phone, 
          phoneVerified: phoneVerification,
          lastLoginAt: new Date()
        },
      });
    } else {
      // Check if phone exists but without appwriteUserId (edge case)
      const existingPhoneUser = await prisma.user.findUnique({ where: { phone } });
      if (existingPhoneUser) {
        user = await prisma.user.update({
          where: { phone },
          data: {
            appwriteUserId,
            phoneVerified: phoneVerification,
            lastLoginAt: new Date()
          }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            appwriteUserId,
            phone,
            phoneVerified: phoneVerification,
            lastLoginAt: new Date()
          },
        });
      }
    }

    // 3. Issue Local JWT
    const accessToken = jwt.sign(
      { id: user.id, phone: user.phone },
      env.JWT_SECRET,
      { expiresIn: '7d' } // 7 days token
    );

    res.json({
      message: 'Authentication successful',
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
      },
    });

  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        phoneVerified: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      }
    });

    if (!user) {
      throw createError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  // In a JWT-only stateless setup, logout is handled by the client dropping the token.
  // If we had refresh tokens, we would revoke them here.
  res.json({ message: 'Logged out successfully' });
};
