import * as Minio from "minio";
import dotEnv from "./dotEnv";
import logger from "../utils/logger";

/**
 * Initializes the MinIO client using centralized environment variables.
 * Supports endpoint, port, SSL, and root credentials configuration.
 */
export const minioClient = new Minio.Client({
  endPoint: dotEnv.minioEndpoint,
  port: dotEnv.minioPort,
  useSSL: dotEnv.minioUseSSL,
  accessKey: dotEnv.minioAccessKey,
  secretKey: dotEnv.minioSecretKey,
});

/**
 * Uploads a file buffer to a specified MinIO bucket.
 * Automatically creates the bucket if it does not already exist.
 * @param {string} bucketName - Name of the MinIO bucket.
 * @param {string} objectName - Name (path) of the object in the bucket.
 * @param {Buffer} buffer - The file content buffer.
 * @param {string} mimetype - Content-Type of the file.
 * @returns {Promise<void>}
 */
export const uploadFile = async (
  bucketName: string,
  objectName: string,
  buffer: Buffer,
  mimetype: string,
): Promise<void> => {
  try {
    const exists = await minioClient.bucketExists(bucketName).catch(() => false);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");

      // Set public policy for reports bucket
      if (bucketName === "reports") {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        logger.info(`Public read policy set for MinIO bucket: ${bucketName}`);
      }
    }
    await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
      "Content-Type": mimetype,
    });
    logger.info(`File ${objectName} successfully uploaded to MinIO bucket ${bucketName}`);
  } catch (error) {
    logger.error(`Failed to upload file to MinIO:`, error);
    throw error;
  }
};

/**
 * Retrieves a file as a Buffer from MinIO.
 * Useful for processing files in memory (e.g., generating thumbnails or hashing).
 *
 * @param {string} bucketName - Name of the MinIO bucket.
 * @param {string} objectName - Name (path) of the object to retrieve.
 * @returns {Promise<Buffer>}
 */
export const getObject = async (bucketName: string, objectName: string): Promise<Buffer> => {
  try {
    const dataStream = await minioClient.getObject(bucketName, objectName);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      dataStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      dataStream.on("end", () => resolve(Buffer.concat(chunks)));
      dataStream.on("error", (err: Error) => reject(err));
    });
  } catch (error) {
    logger.error(`Failed to get object from MinIO:`, error);
    throw error;
  }
};
