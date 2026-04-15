import crypto from "crypto";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { logger, getObject, uploadFile } from "@dam/shared";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, unlinkSync, readFileSync } from "fs";

/**
 * Analyzes an image: generates a thumbnail and calculates a hash.
 * Mock classification returns dummy data.
 *
 * @param {string} assetId
 * @param {string} storageKey
 * @returns {Promise<any>}
 */
export const processImage = async (assetId: string, storageKey: string): Promise<any> => {
  logger.info(`[Worker] Analyzing image asset: ${assetId}`);
  const fileBuffer = await getObject("assets", storageKey);

  // 1. Generate Thumbnail
  const thumbnail = await sharp(fileBuffer)
    .resize(300, 300, { fit: "inside" })
    .toFormat("webp")
    .toBuffer();

  const thumbKey = `thumbnails/${assetId}.webp`;
  await uploadFile("assets", thumbKey, thumbnail, "image/webp");

  // 2. Calculate Perceptual Hash (Simple hash for now)
  const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");

  // 3. Mock classification
  const analysisResults = {
    colors: ["#232323", "#ffffff", "#8b5cf6"],
    objects: ["Product", "Packaging"],
    hasText: true,
    thumbnailUrl: thumbKey,
  };

  return { hash, analysisResults };
};

/**
 * Analyzes a video: generates a thumbnail frame and calculates a hash.
 * Uses fluent-ffmpeg to capture a frame.
 *
 * @param {string} assetId
 * @param {string} storageKey
 * @returns {Promise<any>}
 */
export const processVideo = async (assetId: string, storageKey: string): Promise<any> => {
  logger.info(`[Worker] Analyzing video asset: ${assetId}`);
  const fileBuffer = await getObject("assets", storageKey);

  // Temporary file for ffmpeg
  const tempIn = join(tmpdir(), `${assetId}_in`);
  const tempOut = join(tmpdir(), `${assetId}_thumb.jpg`);
  writeFileSync(tempIn, fileBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg(tempIn)
      .screenshots({
        timestamps: ["00:00:01"],
        filename: `${assetId}_thumb.jpg`,
        folder: tmpdir(),
        size: "640x?",
      })
      .on("end", async () => {
        try {
          const thumbBuffer = readFileSync(tempOut);
          const thumbKey = `thumbnails/${assetId}.jpg`;
          await uploadFile("assets", thumbKey, thumbBuffer, "image/jpeg");

          unlinkSync(tempIn);
          unlinkSync(tempOut);

          const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
          const analysisResults = {
            duration: "00:00:05", // Mock
            resolution: "1920x1080",
            thumbnailUrl: thumbKey,
          };

          resolve({ hash, analysisResults });
        } catch (err: unknown) {
          reject(err);
        }
      })
      .on("error", (err: Error) => {
        unlinkSync(tempIn);
        reject(err);
      });
  });
};

/**
 * Main entry point for asset analysis. Routes to specific processors based on mimetype.
 * @param {string} assetId
 * @param {string} storageKey
 * @param {string} type - Mimetype of the asset.
 * @returns {Promise<any>}
 */

export const analyzeAsset = async (
  assetId: string,
  storageKey: string,
  type: string,
): Promise<any> => {
  if (type.startsWith("image")) {
    return processImage(assetId, storageKey);
  } else if (type.startsWith("video")) {
    return processVideo(assetId, storageKey);
  }

  // Default for other types
  logger.info(`[Worker] Analyzing generic asset: ${assetId}`);
  const fileBuffer = await getObject("assets", storageKey);
  const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
  return { hash, analysisResults: { type, generic: true } };
};
