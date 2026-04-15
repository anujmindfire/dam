# MinIO Setup & Usage Guide

MinIO is used as the object storage layer in the DAM system. This guide explains how to set it up locally and how the application interacts with it.

## 1. Prerequisites
- Docker & Docker Compose installed.
- Node.js environment configured (already part of the monorepo).

## 2. Setting Up MinIO (Docker)

MinIO is included in the `infra/docker/docker-compose.yml`. To start it, run:
```bash
npm run docker:up
```

### Accessing the Console
Once started, you can manage MinIO via its web-based console:
- **URL**: [http://localhost:9001](http://localhost:9001)
- **Access Key**: `minioadmin` (Default)
- **Secret Key**: `minioadmin` (Default)

## 3. Configuration in DAM

The application connects to MinIO using the variables defined in your `.env` file (managed via `packages/shared/src/config/dotEnv.ts`):

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
```

## 4. Usage in Services

The `@dam/shared` package provides a configured `minioClient` and a simplified `uploadFile` utility.

### Uploading a File
```typescript
import { uploadFile } from "@dam/shared";

const handleUpload = async (fileBuffer: Buffer, originalName: string, mimetype: string) => {
  const bucketName = "assets";
  const objectName = `uploads/${Date.now()}-${originalName}`;

  await uploadFile(bucketName, objectName, fileBuffer, mimetype);
  
  return objectName; // Store this storageKey in the database
};
```

### Direct Client Access
If you need advanced features (presigned URLs, deletions), use the raw client:
```typescript
import { minioClient } from "@dam/shared";

const getDownloadUrl = async (bucket: string, object: string) => {
  return await minioClient.presignedGetObject(bucket, object, 24 * 60 * 60);
};
```

## 5. Security Notes
- In **Production**, ensure `MINIO_USE_SSL` is set to `true`.
- Never commit your actual `MINIO_SECRET_KEY` to version control; use environment secrets or the root `.env` (which should be in `.gitignore`).
