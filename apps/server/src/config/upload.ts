import multer from "multer";

/**
 * Multer middleware configured for memory storage.
 * Accepts a single file field named 'file'.
 * Max file size: 5GB for large media files.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB
});
