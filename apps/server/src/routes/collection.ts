import express, { Router } from "express";
import {
  create,
  list,
  getById,
  update,
  remove,
  addAssetToCollection,
} from "../controllers/collection";
import { verifyToken } from "../config/verifyToken";
import {
  validateCollectionCreate,
  validateCollectionUpdate,
  validateList,
  defaultRoute,
  updateRoute,
  apiUrl,
} from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);
apiRoutes.post(defaultRoute, validateCollectionCreate, create);
apiRoutes.get(defaultRoute, validateList, list);
apiRoutes.get(updateRoute, getById);
apiRoutes.patch(updateRoute, validateCollectionUpdate, update);
apiRoutes.delete(updateRoute, remove);
apiRoutes.post(`${updateRoute}${apiUrl.assets}`, addAssetToCollection);

export default apiRoutes;
