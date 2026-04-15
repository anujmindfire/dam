import express, { Router } from "express";
import { overview, compliance } from "../controllers/usage";
import { verifyToken } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);

// Dashboard analytics
apiRoutes.get("/overview", overview);
apiRoutes.get("/compliance", compliance);

export default apiRoutes;
