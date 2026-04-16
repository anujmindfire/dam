import multer from "multer";

/**
 * Multer middleware configured with memory storage.
 * Stores file buffer in memory for direct MinIO upload.
 * Max file size: 5GB for large media files.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 * 1024 },
});
