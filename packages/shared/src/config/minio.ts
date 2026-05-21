import * as Minio from "minio";
import dotEnv from "./dotEnv";
import logger from "../utils/logger";
import { storage } from "../utils/constant";

/**
 * Initializes the MinIO client using centralized environment variables.
 * Supports endpoint, port, SSL, and root credentials configuration.
 */
export const minioClient = new Minio.Client({
  endPoint: dotEnv.minioEndpoint,
  port: dotEnv.minioPort,
  useSSL: false, // Set to true if using HTTPS
  accessKey: dotEnv.minioAccessKey,
  secretKey: dotEnv.minioSecretKey,
  region: "us-east-1",
});

/**
 * Dedicated client for generating presigned URLs.
 * Uses the public-facing URL (minioPublicUrl) so signatures are computed
 * with the correct host header (e.g. minio.local:8080) that the client browser uses.
 */
let presignClient = minioClient;
if (dotEnv.minioPublicUrl) {
  try {
    const parsed = new URL(dotEnv.minioPublicUrl);
    presignClient = new Minio.Client({
      endPoint: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : (parsed.protocol === "https:" ? 443 : 80),
      useSSL: parsed.protocol === "https:",
      accessKey: dotEnv.minioAccessKey,
      secretKey: dotEnv.minioSecretKey,
      region: "us-east-1",
    });
  } catch (err) {
    logger.error("Failed to parse minioPublicUrl for presignClient:", err);
  }
}

/**
 * Rewrites internal MinIO URLs (cluster DNS) to the public-facing URL
 * for client-side access (browser downloads/uploads).
 */
const rewriteUrl = (url: string): string => {
  if (!dotEnv.minioPublicUrl) return url;

  // Remove protocol for hostname matching
  const internal = `${dotEnv.minioEndpoint}:${dotEnv.minioPort}`;
  const publicUrl = dotEnv.minioPublicUrl.replace(/^https?:\/\//, "");

  // Replace internal host:port with public host (which might include a port or path)
  let rewritten = url.replace(internal, publicUrl);

  // Handle cases where the internal hostname might be used without the port
  if (rewritten === url) {
    rewritten = url.replace(dotEnv.minioEndpoint, publicUrl);
  }

  // Ensure protocol matches the public URL
  const protocol = dotEnv.minioPublicUrl.startsWith("https") ? "https://" : "http://";
  return rewritten.replace(/^https?:\/\//, protocol);
};

/**
 * Configures CORS and public policies for a bucket.
 */
export const configureBucket = async (bucketName: string = storage.bucket): Promise<void> => {
  try {
    const exists = await minioClient.bucketExists(bucketName).catch(() => false);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
    }

    // Set CORS policy to allow direct uploads from the dashboard
    const corsConfig = {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: ["*"], // In production, restrict this to your domain
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    // Note: If the SDK version doesn't support setBucketCors, we skip it
    // or use a console command. For MinIO, CORS can also be set via policy.
    try {
      await (
        minioClient as unknown as {
          setBucketCors: (bucket: string, config: unknown) => Promise<void>;
        }
      ).setBucketCors(bucketName, corsConfig);
      logger.info(`CORS policy set for MinIO bucket: ${bucketName}`);
    } catch (corsErr) {
      logger.warn(`Could not set CORS via SDK for ${bucketName}. Ensure it is set via Console/MC.`);
    }

    // Set public policy for reports bucket if needed
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
  } catch (error) {
    logger.error(`Failed to configure MinIO bucket ${bucketName}:`, error);
  }
};

/**
 * Ensures a bucket exists, creates it if it doesn't, and applies configuration.
 */
export const createBucketIfNotExists = async (bucketName: string): Promise<void> => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
      logger.info(`Bucket created: ${bucketName}`);
      await configureBucket(bucketName);
    }
  } catch (error) {
    logger.error(`Error ensuring bucket ${bucketName} exists:`, error);
    throw error;
  }
};

/**
 * Uploads a file to a MinIO bucket. Supports both file paths and Buffers.
 */
export const uploadFile = async (
  bucketName: string,
  objectName: string,
  data: string | Buffer,
  contentType?: string,
): Promise<void> => {
  try {
    await createBucketIfNotExists(bucketName);
    const metaData: Record<string, string> = {};
    if (contentType) {
      metaData["Content-Type"] = contentType;
    }

    if (Buffer.isBuffer(data)) {
      await minioClient.putObject(bucketName, objectName, data, data.length, metaData);
    } else {
      await minioClient.fPutObject(bucketName, objectName, data, metaData);
    }
  } catch (error) {
    logger.error(`Failed to upload file to MinIO:`, error);
    throw error;
  }
};

/**
 * Downloads a file from a MinIO bucket as a Buffer.
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

/**
 * Generates a presigned URL for downloading an object from MinIO.
 */
export const getPresignedUrl = async (
  bucketName: string,
  objectName: string,
  expiry: number = 3600,
): Promise<string> => {
  try {
    const url = await presignClient.presignedGetObject(bucketName, objectName, expiry);
    return presignClient !== minioClient ? url : rewriteUrl(url);
  } catch (error) {
    logger.error(`Failed to generate presigned URL:`, error);
    throw error;
  }
};

/**
 * Generates a presigned URL for uploading an object to MinIO.
 */
export const getPresignedPutUrl = async (
  bucketName: string,
  objectName: string,
  expiry: number = 3600,
): Promise<string> => {
  try {
    const url = await presignClient.presignedPutObject(bucketName, objectName, expiry);
    return presignClient !== minioClient ? url : rewriteUrl(url);
  } catch (error) {
    logger.error(`Failed to generate presigned upload URL:`, error);
    throw error;
  }
};

/**
 * Deletes an object from a MinIO bucket.
 * Silently swallows "not found" errors so callers don't need to guard.
 */
export const deleteFile = async (bucketName: string, objectName: string): Promise<void> => {
  try {
    await minioClient.removeObject(bucketName, objectName);
    logger.info(`Deleted MinIO object: ${bucketName}/${objectName}`);
  } catch (error) {
    // Non-fatal: object may have already been removed or never existed
    logger.warn(`Could not delete MinIO object ${bucketName}/${objectName}:`, error);
  }
};
