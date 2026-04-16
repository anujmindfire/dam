declare module 'minio';
/**
 * Initializes the MinIO client using centralized environment variables.
 * Supports endpoint, port, SSL, and root credentials configuration.
 */
export declare const minioClient: any;
/**
 * Uploads a file buffer to a specified MinIO bucket.
 * Automatically creates the bucket if it does not already exist.
 * @param {string} bucketName - Name of the MinIO bucket.
 * @param {string} objectName - Name (path) of the object in the bucket.
 * @param {Buffer} buffer - The file content buffer.
 * @param {string} mimetype - Content-Type of the file.
 * @returns {Promise<void>}
 */
export declare const uploadFile: (bucketName: string, objectName: string, buffer: Buffer, mimetype: string) => Promise<void>;
/**
 * Retrieves a file as a Buffer from MinIO.
 * Useful for processing files in memory (e.g., generating thumbnails or hashing).
 *
 * @param {string} bucketName - Name of the MinIO bucket.
 * @param {string} objectName - Name (path) of the object to retrieve.
 * @returns {Promise<Buffer>}
 */
export declare const getObject: (bucketName: string, objectName: string) => Promise<Buffer>;
