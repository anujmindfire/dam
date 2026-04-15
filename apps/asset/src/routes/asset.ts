import express, { Router } from "express";
import { upload as uploadController, create, list, getById, update, transitionStatus, remove } from "../controllers/asset";
import { upload } from "../config/upload";
import {
  verifyToken,
  validateAssetUpload,
  validateStatusTransition,
  validateList,
  defaultRoute,
  updateRoute,
} from "@dam/shared";

const apiRoutes: Router = express.Router();

/**
 * All asset routes require JWT authentication.
 */
apiRoutes.use(verifyToken);

// File upload endpoint — multipart/form-data
apiRoutes.post("/upload", upload.single("file"), uploadController);

// Standard CRUD
apiRoutes.post(defaultRoute, validateAssetUpload, create);
apiRoutes.get(defaultRoute, validateList, list);
apiRoutes.get(updateRoute, getById);
apiRoutes.patch(updateRoute, update);
apiRoutes.patch(`${updateRoute}/status`, validateStatusTransition, transitionStatus);
apiRoutes.delete(updateRoute, remove);

export default apiRoutes;
