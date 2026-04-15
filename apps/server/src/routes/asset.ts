import express, { Router } from "express";
import {
  create,
  list,
  getById,
  update,
  transitionStatus,
  remove,
  upload as uploadController,
} from "../controllers/asset";
import { verifyToken } from "../config/verifyToken";
import { upload } from "../config/upload";
import { 
  validateAssetUpload, 
  validateStatusTransition,
  validateList,
  defaultRoute,
  updateRoute,
} from "@dam/shared";

const apiRoutes: Router = express.Router();

/**
 * All asset management routes require authentication.
 */
apiRoutes.use(verifyToken);

// File Upload (multipart/form-data)
apiRoutes.post("/upload", upload.single("file"), uploadController);

// Standard CRUD
apiRoutes.post(defaultRoute, create);
apiRoutes.get(defaultRoute, validateList, list);
apiRoutes.get(updateRoute, getById);
apiRoutes.patch(updateRoute, validateAssetUpload, update);
apiRoutes.patch(`${updateRoute}/status`, validateStatusTransition, transitionStatus);
apiRoutes.delete(updateRoute, remove);

export default apiRoutes;
