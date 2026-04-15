import express, { Router } from "express";
import { login, logout } from "../controllers/auth";
import { verifyToken } from "../config/verifyToken";
import { loginValidator, apiUrl } from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.post(apiUrl.login, loginValidator, login);
apiRoutes.post(apiUrl.logout, verifyToken, logout);

export default apiRoutes;
