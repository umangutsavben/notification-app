import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { env } from '../config/env';
import prisma from '../database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
  };
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Unauthorized: Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw createError(401, 'Unauthorized: Token not provided');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; phone: string };
    
    // Optional: Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isActive: true },
    });

    if (!user || !user.isActive) {
      throw createError(401, 'Unauthorized: User not found or inactive');
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(createError(401, 'Unauthorized: Invalid token'));
  }
};
