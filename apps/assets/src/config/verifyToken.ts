import { verifyTokenFactory, userModel, dotEnv } from "@dam/shared";
import { Request, Response, NextFunction } from "express";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  return verifyTokenFactory(dotEnv.accessToken as string, dotEnv.appDomain as string, userModel)(
    req,
    res,
    next,
  );
};
