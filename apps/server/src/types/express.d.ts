import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      email: string;
      tokenVersion: number;
      roleId: number;
    };
  }
}

declare module "express" {
  interface Request {
    user?: {
      id: number;
      email: string;
      tokenVersion: number;
      roleId: number;
    };
  }
}

export {};
