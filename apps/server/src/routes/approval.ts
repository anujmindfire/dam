import express, { Router } from "express";
import { request, list, getById, approve, reject, history } from "../controllers/approval";
import { verifyToken } from "../config/verifyToken";
import { updateRoute, defaultRoute, apiUrl, roleId, authorizeRoles } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
apiRoutes.post(defaultRoute, request);
apiRoutes.get(defaultRoute, list);
apiRoutes.get(updateRoute, getById);
apiRoutes.patch(`${updateRoute}${apiUrl.approve}`, authorizeRoles(roleId.admin), approve);
apiRoutes.patch(`${updateRoute}${apiUrl.reject}`, authorizeRoles(roleId.admin), reject);
apiRoutes.get(`${apiUrl.assets}/:assetsId${apiUrl.history}`, history);

export default apiRoutes;
