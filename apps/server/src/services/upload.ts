import { Request } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  uploadFile,
  statusCode,
  CustomError,
} from "@dam/shared";
import { createAsset } from "./asset";

const BUCKET_NAME = "assets";

/**
 * Handles the uploaded file buffer, stores it in MinIO, 
 * generates a unique storage key, then delegates full record creation to createAsset.
 *
 * @param {Request} req - Express request object with `req.file` from multer.
 * @returns {Promise<any | CustomError>} The created asset record or an error.
 */
export const uploadAsset = async (req: Request) => {
  try {
    if (!req.file) {
      return new CustomError("No file provided in the request", statusCode.badRequest);
    }

    const { buffer, mimetype, originalname, size } = req.file;
    const ext = path.extname(originalname);
    const storageKey = `uploads/${uuidv4()}${ext}`;

    // 1. Upload file buffer to MinIO
    await uploadFile(BUCKET_NAME, storageKey, buffer, mimetype);

    // 2. Inject derived file fields into request body for createAsset
    req.body.filename = originalname;
    req.body.storageKey = storageKey;
    req.body.size = size;
    req.body.mimetype = mimetype;

    // 3. Delegate to asset creation (creates DB records + publishes event)
    return await createAsset(req);
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
