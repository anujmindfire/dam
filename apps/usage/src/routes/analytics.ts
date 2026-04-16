import express, { Router } from "express";
import { overview, compliance, report, triggerReport } from "../controllers/usage";
import { verifyToken } from "../config/verifyToken";
import { apiUrl, roleId, authorizeRoles } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
apiRoutes.get(apiUrl.overview, authorizeRoles(roleId.admin), overview);
apiRoutes.get(apiUrl.compliance, authorizeRoles(roleId.admin), compliance);
apiRoutes.get(apiUrl.report, authorizeRoles(roleId.admin), report);
apiRoutes.post(`${apiUrl.report}/trigger`, authorizeRoles(roleId.admin), triggerReport);

export default apiRoutes;
