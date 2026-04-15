import multer from "multer";

/**
 * Multer middleware configured for memory storage.
 * Accepts a single file field named 'file'.
 * Max file size: 100MB.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});
