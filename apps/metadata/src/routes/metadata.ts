import express, { Router } from "express";
import { getByAsset, update, search, duplicates } from "../controllers/metadata";
import { verifyToken } from "../config/verifyToken";
import { apiUrl } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
apiRoutes.get(apiUrl.search, search);
apiRoutes.get(apiUrl.duplicates, duplicates);
apiRoutes.get("/:assetsId", getByAsset);
apiRoutes.patch("/:assetsId", update);

export default apiRoutes;
