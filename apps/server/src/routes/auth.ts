import express, { Router } from "express";
import { login, logout, signup, refresh } from "../controllers/auth";
import { verifyToken } from "../config/verifyToken";
import { loginValidator, validateUserCreate, apiUrl } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.post(apiUrl.login, loginValidator, login);
apiRoutes.post(apiUrl.logout, verifyToken, logout);
apiRoutes.post(apiUrl.signup, validateUserCreate, signup);
apiRoutes.post(apiUrl.refresh, refresh);

export default apiRoutes;
