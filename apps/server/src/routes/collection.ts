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
  apiUrl
} from "@dam/shared";

const apiRoutes: Router = express.Router();

apiRoutes.post(defaultRoute, validateCollectionCreate, verifyToken, create);
apiRoutes.get(defaultRoute, validateList, verifyToken, list);
apiRoutes.get(updateRoute, verifyToken, getById);
apiRoutes.patch(updateRoute, validateCollectionUpdate, verifyToken, update);
apiRoutes.delete(updateRoute, verifyToken, remove);
apiRoutes.post(`${updateRoute}${apiUrl.assest}`, verifyToken, addAssetToCollection);

export default apiRoutes;
