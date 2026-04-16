import express, { Router } from "express";
import { create, list, update, remove } from "../controllers/user";
import {
  validateUserCreate,
  validateList,
  validateUserUpdate,
  authorizeRoles,
  defaultRoute,
  updateRoute,
  roleId,
} from "@dam/shared";
import { verifyToken } from "../config/verifyToken";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
const adminAccess = authorizeRoles(roleId.admin);
apiRoutes.post(defaultRoute, validateUserCreate, create);
apiRoutes.get(defaultRoute, adminAccess, validateList, list);
apiRoutes.patch(updateRoute, adminAccess, validateUserUpdate, update);
apiRoutes.delete(updateRoute, adminAccess, remove);

export default apiRoutes;
