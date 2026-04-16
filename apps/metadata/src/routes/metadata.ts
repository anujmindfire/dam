import express, { Router } from "express";
import { getByAsset, update, search, duplicates } from "../controllers/metadata";
import { verifyToken } from "../config/verifyToken";
import { apiUrl, updateRoute } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
apiRoutes.get(apiUrl.search, search);
apiRoutes.get(apiUrl.duplicates, duplicates);
apiRoutes.get(updateRoute, getByAsset);
apiRoutes.patch(updateRoute, update);

export default apiRoutes;
