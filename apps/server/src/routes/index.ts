import express, { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import collection from "./collection";
import approval from "./approval";
import { proxyRequest } from "../utils/proxy";
import {
  apiUrl,
  baseRoute,
  defaultRoute,
  sendSuccessResponse,
  statusCode,
  commonMsg,
  dotEnv,
} from "@dam/shared";

const router: Router = express.Router();

/****** HEALTH CHECK ******/
router.get(defaultRoute, (_req: Request, res: Response) => {
  sendSuccessResponse({ res, statusCode: statusCode.success, message: commonMsg.healthy });
});

router.get(`${baseRoute}/health`, async (_req: Request, res: Response) => {
  sendSuccessResponse({
    res,
    statusCode: statusCode.success,
    message: "System is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

/****** AUTH (Gateway Local) ******/
router.use(`${baseRoute}${apiUrl.auth}`, auth);

/****** USER (Gateway Local) ******/
router.use(`${baseRoute}${apiUrl.user}`, user);

/****** COLLECTION (Gateway Local) ******/
router.use(`${baseRoute}${apiUrl.collection}`, collection);

/****** ASSET (Proxy to Microservice) ******/
router.all(`${baseRoute}${apiUrl.assets}*`, proxyRequest("localhost", dotEnv.assetsPort));

/****** APPROVAL (Gateway Local) ******/
router.use(`${baseRoute}${apiUrl.approval}`, approval);

/****** METADATA (Proxy to Microservice) ******/
router.all(`${baseRoute}${apiUrl.metadata}*`, proxyRequest("localhost", dotEnv.metadataPort));

/****** USAGE (Proxy to Microservice) ******/
router.all(`${baseRoute}${apiUrl.usage}*`, proxyRequest("localhost", dotEnv.usagePort));

/****** ANALYTICS (Proxy to Microservice) ******/
router.all(`${baseRoute}${apiUrl.analytics}*`, proxyRequest("localhost", dotEnv.usagePort));

export default router;
