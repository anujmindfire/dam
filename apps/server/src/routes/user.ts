import express, { Router } from "express";
import { create, list, update, remove } from "../controllers/user";
import {
  validateUserCreate,
  validateList,
  validateUserUpdate,
  authorizeRoles,
  defaultRoute,
  updateRoute,
} from "@dam/shared";
import { verifyToken } from "../config/verifyToken";

const apiRoutes: Router = express.Router();

const adminAccess = authorizeRoles(1);
apiRoutes.post(defaultRoute, validateUserCreate, create);
apiRoutes.get(defaultRoute, verifyToken, adminAccess, validateList, list);
apiRoutes.patch(updateRoute, verifyToken, adminAccess, validateUserUpdate, update);
apiRoutes.delete(updateRoute, verifyToken, adminAccess, remove);

export default apiRoutes;
