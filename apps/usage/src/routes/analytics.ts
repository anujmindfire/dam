import express, { Router } from "express";
import { overview, compliance, report, triggerReport } from "../controllers/usage";
import { verifyToken } from "../config/verifyToken";
import { apiUrl, roleId, authorizeRoles } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
// All authenticated users can view analytics — non-admin results are scoped to their own assets
apiRoutes.get(apiUrl.overview, overview);
apiRoutes.get(apiUrl.compliance, compliance);
// Report generation stays admin-only; regular users can view a read-only version
apiRoutes.get(apiUrl.report, report);
apiRoutes.post(`${apiUrl.report}/trigger`, authorizeRoles(roleId.admin), triggerReport);

export default apiRoutes;
