import { AppError } from "../types/index.js";

export const createError = (statusCode: number, message: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const isOperationalError = (error: Error): boolean => {
  if (error instanceof Error) {
    return (error as AppError).isOperational !== false;
  }
  return false;
};

export const handleAsyncError = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return (...args: T): Promise<R> => {
    return fn(...args).catch((error: Error) => {
      throw createError(500, error.message);
    });
  };
};
