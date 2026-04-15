import multer from "multer";

/**
 * Multer middleware configured with memory storage.
 * Stores file buffer in memory for direct MinIO upload.
 * Max file size: 100MB.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});
