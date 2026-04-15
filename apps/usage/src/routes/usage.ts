import express, { Router } from "express";
import { track, getByAsset, list, overview, compliance } from "../controllers/usage";
import { verifyToken } from "@dam/shared";

const apiRoutes: Router = express.Router();

/**
 * All usage and analytics routes require authentication.
 */
apiRoutes.use(verifyToken);

// Usage tracking
apiRoutes.post("/track", track);
apiRoutes.get("/", list);
apiRoutes.get("/:assetId", getByAsset);

export default apiRoutes;
