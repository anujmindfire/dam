import crypto from "crypto";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { logger, getObject, uploadFile } from "@dam/shared";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, unlinkSync, readFileSync, existsSync } from "fs";

/**
 * Analyzes an image: generates a thumbnail and calculates a hash.
 * Mock classification returns dummy data.
 *
 * @param {string} assetsId
 * @param {string} storageKey
 * @returns {Promise<any>}
 */
export const processImage = async (assetsId: string, storageKey: string): Promise<any> => {
  logger.info(`[Worker] Analyzing image assets: ${assetsId}`);
  const fileBuffer = await getObject("assets", storageKey);

  // 1. Generate Thumbnail
  const thumbnail = await sharp(fileBuffer)
    .resize(300, 300, { fit: "inside" })
    .toFormat("webp")
    .toBuffer();

  const thumbKey = `thumbnails/${assetsId}.webp`;
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
 * @param {string} assetsId
 * @param {string} storageKey
 * @returns {Promise<any>}
 */
export const processVideo = async (assetsId: string, storageKey: string): Promise<any> => {
  logger.info(`[Worker] Analyzing video assets: ${assetsId}`);
  const fileBuffer = await getObject("assets", storageKey);

  // Temporary file for ffmpeg
  const tempIn = join(tmpdir(), `${assetsId}_in`);
  const tempOut = join(tmpdir(), `${assetsId}_thumb.webp`);
  writeFileSync(tempIn, fileBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg(tempIn)
      .screenshots({
        timestamps: ["00:00:01"],
        filename: `${assetsId}_thumb.webp`,
        folder: tmpdir(),
        size: "640x?",
      })
      .on("end", async () => {
        try {
          const thumbBuffer = readFileSync(tempOut);
          const thumbKey = `thumbnails/${assetsId}.webp`;
          await uploadFile("assets", thumbKey, thumbBuffer, "image/webp");

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
        if (existsSync(tempIn)) unlinkSync(tempIn);
        reject(err);
      });
  });
};

/**
 * Main entry point for assets analysis. Routes to specific processors based on mimetype.
 * @param {string} assetsId
 * @param {string} storageKey
 * @param {string} type - Mimetype of the assets.
 * @returns {Promise<any>}
 */

export const analyzeAsset = async (
  assetsId: string,
  storageKey: string,
  type: string,
): Promise<any> => {
  if (type.startsWith("image")) {
    return processImage(assetsId, storageKey);
  } else if (type.startsWith("video")) {
    return processVideo(assetsId, storageKey);
  }

  // Default for other types (Documents, Audio, etc.)
  logger.info(`[Worker] Analyzing generic assets: ${assetsId} (Type: ${type})`);
  const fileBuffer = await getObject("assets", storageKey);
  const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");

  // Simulated Intelligence: Advanced Feature Extraction
  const analysisResults: any = {
    type,
    fileSize: fileBuffer.length,
    processedAt: new Date().toISOString(),
    confidence: 0.95,
  };

  // 1. Classification based on Mimetype
  if (type.includes("pdf")) {
    analysisResults.category = "Document";
    analysisResults.objects = ["Text", "Official", "Multi-Page"];
    analysisResults.pageCount = Math.floor(Math.random() * 15) + 1;
    analysisResults.isSearchable = true;
  } else if (type.includes("audio")) {
    analysisResults.category = "Audio";
    analysisResults.objects = ["Sound", "Media", "Waveform"];
    analysisResults.bitrate = "320kbps";
  } else if (type.includes("spreadsheet") || type.includes("excel")) {
    analysisResults.category = "Data";
    analysisResults.objects = ["Spreadsheet", "Table", "Calculations"];
    analysisResults.sheetCount = Math.floor(Math.random() * 5) + 1;
  } else if (type.includes("zip") || type.includes("archive")) {
    analysisResults.category = "Archive";
    analysisResults.objects = ["Compressed", "Container", "Multiple-Files"];
  } else {
    analysisResults.category = "General";
    analysisResults.objects = ["Other", "Asset", "Legacy"];
  }

  // 2. Similarity Tagging (Mock similarity check)
  analysisResults.smartTags = [...analysisResults.objects, "Auto-Classified"];

  return { hash, analysisResults };
};
