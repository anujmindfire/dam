import express, { Router } from "express";
import { overview, compliance, track, usageHistory } from "../controllers/analytics";
import { verifyToken } from "../config/verifyToken";
import { updateRoute } from "@dam/shared";

const apiRoutes: Router = express.Router();

/**
 * All analytics and usage routes require authentication.
 */
apiRoutes.use(verifyToken);

// System analytics
apiRoutes.get("/overview", overview);
apiRoutes.get("/compliance", compliance);

// Usage tracking
apiRoutes.post("/track", track);
apiRoutes.get(`/track${updateRoute}`, usageHistory);

export default apiRoutes;
