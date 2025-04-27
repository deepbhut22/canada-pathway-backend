import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorMiddleware';
import User from '../models/userModel';

interface JwtPayload {
  id: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      // Get user from the database
      req.user = await User.findById(decoded.id).select('-password');    

      next();
    } catch (error) {
      next(new AppError('Not authorized, token failed', 401));
    }
  }

  if (!token) {
    next(new AppError('Not authorized, no token', 401));
  }
};