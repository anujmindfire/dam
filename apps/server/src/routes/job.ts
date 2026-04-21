import express, { Router } from "express";
import { authorizeRoles, roleId } from "@dam/shared";
import { verifyToken } from "../config/verifyToken";
import { list } from "../controllers/job";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken as any);
const adminAccess = authorizeRoles(roleId.admin);

apiRoutes.get("/", adminAccess as any, list);

export default apiRoutes;
