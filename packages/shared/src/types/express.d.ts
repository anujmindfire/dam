import "express";

/**
 * Extends the global Express Request interface to include the authenticated user object.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        tokenVersion: number;
        roleId: number;
      };
    }
  }
}

export {};
