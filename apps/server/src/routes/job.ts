import express, { Router } from "express";
import { verifyToken } from "../config/verifyToken";
import { list } from "../controllers/job";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken as any);

// All authenticated users can view jobs
apiRoutes.get("/", list as any);

export default apiRoutes;
