import express, { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import collection from "./collection";
import asset from "./asset";
import approval from "./approval";
import analytics from "./analytics";
import {
  apiUrl,
  baseRoute,
  defaultRoute,
  sendSuccessResponse,
  statusCode,
  common,
} from "@dam/shared";

const router: Router = express.Router();

/****** HEALTH CHECK ******/
router.get(defaultRoute, (_req: Request, res: Response) => {
  sendSuccessResponse({ res, statusCode: statusCode.success, message: common.healthy });
});

/****** AUTH ******/
router.use(`${baseRoute}${apiUrl.auth}`, auth);

/****** USER ******/
router.use(`${baseRoute}${apiUrl.user}`, user);

/****** COLLECTION ******/
router.use(`${baseRoute}${apiUrl.collection}`, collection);

/****** ASSET ******/
router.use(`${baseRoute}${apiUrl.assest}`, asset);

/****** APPROVAL ******/
router.use(`${baseRoute}/approvals`, approval);

/****** STATISTICS & ANALYTICS ******/
router.use(`${baseRoute}/stats`, analytics);

export default router;
