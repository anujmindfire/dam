// Extending Express Request interface

/**
 * Global declaration to extend the Express Request interface.
 * This ensures that 'req.user' is recognized by the TypeScript compiler
 * across all services (server, analytics, usage) that use the shared package.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        roleId: number;
        [key: string]: any;
      };
    }
  }
}
