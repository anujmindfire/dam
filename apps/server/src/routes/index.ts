import express, { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import collection from "./collection";
import approval from "./approval";
import job from "./job";
import { proxyRequest } from "../utils/proxy";
import { apiUrl, baseRoute, sendSuccessResponse, statusCode, dotEnv, commonMsg } from "@dam/shared";

const router: Router = express.Router();

router.get(`${baseRoute}/health`, async (_req: Request, res: Response) => {
  sendSuccessResponse({
    res,
    statusCode: statusCode.success,
    message: commonMsg.healthy,
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
router.all(`${baseRoute}${apiUrl.assets}*`, proxyRequest(dotEnv.assetsHost, dotEnv.assetsPort));

/****** APPROVAL (Gateway Local) ******/
router.use(`${baseRoute}${apiUrl.approval}`, approval);
router.use(`${baseRoute}/jobs`, job);

/****** METADATA (Proxy to Microservice) ******/
router.all(
  `${baseRoute}${apiUrl.metadata}*`,
  proxyRequest(dotEnv.metadataHost, dotEnv.metadataPort),
);

/****** USAGE (Proxy to Microservice) ******/
router.all(`${baseRoute}${apiUrl.usage}*`, proxyRequest(dotEnv.usageHost, dotEnv.usagePort));

/****** ANALYTICS (Proxy to Microservice) ******/
router.all(`${baseRoute}${apiUrl.analytics}*`, proxyRequest(dotEnv.usageHost, dotEnv.usagePort));

export default router;
