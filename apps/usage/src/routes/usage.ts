import express, { Router } from "express";
import { track, getByAsset, list } from "../controllers/usage";
import { verifyToken } from "../config/verifyToken";
import { apiUrl, defaultRoute, updateRoute } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
apiRoutes.post(apiUrl.track, track);
apiRoutes.get(defaultRoute, list);
apiRoutes.get(updateRoute, getByAsset);

export default apiRoutes;
