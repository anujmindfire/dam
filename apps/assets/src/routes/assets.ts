import express, { Router } from "express";
import {
  upload as uploadController,
  list,
  getById,
  update,
  transitionStatus,
  remove,
  uploadVersion,
  download,
  thumbnail,
  getUploadUrl,
  completeUpload,
} from "../controllers/assets";
import { upload } from "../config/upload";
import { verifyToken } from "../config/verifyToken";
import {
  validateStatusTransition,
  validateList,
  defaultRoute,
  updateRoute,
  apiUrl,
} from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
apiRoutes.post(apiUrl.upload, upload.single("file"), uploadController);
apiRoutes.post(`${apiUrl.upload}${apiUrl.presignedUrl}`, getUploadUrl);
apiRoutes.post(`${apiUrl.upload}${apiUrl.complete}`, completeUpload);
apiRoutes.get(defaultRoute, validateList, list);
apiRoutes.get(updateRoute, getById);
apiRoutes.patch(updateRoute, update);
apiRoutes.patch(`${updateRoute}${apiUrl.status}`, validateStatusTransition, transitionStatus);
apiRoutes.post(`${updateRoute}${apiUrl.version}`, upload.single("file"), uploadVersion);
apiRoutes.get(`${updateRoute}/thumbnail`, thumbnail);
apiRoutes.get(`${updateRoute}/download`, download);
apiRoutes.delete(updateRoute, remove);

export default apiRoutes;
