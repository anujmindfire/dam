import express, { Router } from "express";
import {
  upload as uploadController,
  create,
  list,
  getById,
  update,
  transitionStatus,
  remove,
  uploadVersion,
  download,
  thumbnail,
} from "../controllers/assets";
import { upload } from "../config/upload";
import { verifyToken } from "../config/verifyToken";
import {
  validateAssetUpload,
  validateStatusTransition,
  validateList,
  defaultRoute,
  updateRoute,
  apiUrl,
} from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
apiRoutes.post(apiUrl.upload, upload.single("file"), uploadController);
apiRoutes.post(defaultRoute, validateAssetUpload, create);
apiRoutes.get(defaultRoute, validateList, list);
apiRoutes.get(updateRoute, getById);
apiRoutes.patch(updateRoute, update);
apiRoutes.patch(`${updateRoute}${apiUrl.status}`, validateStatusTransition, transitionStatus);
apiRoutes.post(`${updateRoute}${apiUrl.version}`, upload.single("file"), uploadVersion);
apiRoutes.get(`${updateRoute}/thumbnail`, thumbnail);
apiRoutes.get(`${updateRoute}/download`, download);
apiRoutes.delete(updateRoute, remove);

export default apiRoutes;
