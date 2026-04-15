import express, { Router } from "express";
import { getByAsset, update, search, duplicates } from "../controllers/metadata";
import { verifyToken } from "@dam/shared";

const apiRoutes: Router = express.Router();

/**
 * All metadata routes require authentication.
 */
apiRoutes.use(verifyToken);

// Tag-based search and duplicate listing (before /:assetId to avoid route conflicts)
apiRoutes.get("/search", search);
apiRoutes.get("/duplicates", duplicates);

// Per-asset metadata CRUD
apiRoutes.get("/:assetId", getByAsset);
apiRoutes.patch("/:assetId", update);

export default apiRoutes;
