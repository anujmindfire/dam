import express, { Router } from "express";
import { request, list, getById, approve, reject, history } from "../controllers/approval";
import { verifyToken } from "../config/verifyToken";
import { updateRoute, defaultRoute } from "@dam/shared";

const apiRoutes: Router = express.Router();

/**
 * All approval routes require authentication
 */
apiRoutes.use(verifyToken);

// Approval routes
apiRoutes.post(defaultRoute, request);                    // Request approval for asset
apiRoutes.get(defaultRoute, list);                        // List pending approvals
apiRoutes.get(updateRoute, getById);                      // Get approval by ID
apiRoutes.patch(`${updateRoute}/approve`, approve);       // Approve asset
apiRoutes.patch(`${updateRoute}/reject`, reject);         // Reject asset
apiRoutes.get(`/asset/:assetId/history`, history);        // Get approval history for asset

export default apiRoutes;
