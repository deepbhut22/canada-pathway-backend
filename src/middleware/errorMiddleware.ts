import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  message: string;
  stack?: string;
  errors?: any;
}

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  const response: ErrorResponse = {
    message: err.message || 'Server Error',
  };

  // Check if it's our custom error
  if ('statusCode' in err) {
    statusCode = err.statusCode;
    if (err.errors) {
      response.errors = err.errors;
    }
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};