import "express";

/**
 * Extends the global Express Request interface to include the authenticated user object.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tokenVersion: number;
        roleId: number;
      };
    }
  }
}

export {};
