# AuraDAM: Digital Assets Management & Media Intelligence Platform

AuraDAM is a high-performance, scalable Digital Asset Management (DAM) system built with a microservices architecture. It provides robust capabilities for managing digital assets, metadata orchestration, real-time analytics, and automated media processing via an event-driven worker pipeline.

## 🏗 Architecture

The platform follows a **Microservices Architecture** managed within a **Turborepo** monorepo using **pnpm**.

### Core Components

- **API Gateway (Nginx)**: The entry point that routes traffic to internal services.
- **Server Service**: Handles authentication, user management, collections, and orchestrates requests.
- **Asset Service**: Manages the lifecycle of digital assets (upload, CRUD, versioning).
- **Metadata Service**: Handles assets tags, search indexing, and metadata enrichment.
- **Usage Service**: Tracks system-wide activity, audit logs, and engagement analytics.
- **Worker Service**: Background process consumer that handles media analysis and flags.

### Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript.
- **Storage**: MinIO (S3-compatible Object Storage).
- **Database**: PostgreSQL with Sequelize ORM.
- **Messaging**: RabbitMQ (Event-driven communication).
- **Caching**: Redis (Performance optimization).

---

## 🚀 Features

- **Centralized Asset Management**: Securely store, organize, and retrieve assets.
- **Media Intelligence**: Automated background analysis of uploaded assets.
- **Version Control**: Track changes and maintain historical versions of assets.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for users and departments.
- **Audit Logging**: Comprehensive tracking of all system interactions.
- **Advanced Search**: Fast retrieval based on metadata and tags.
- **Collection Management**: Organize assets into logical groups and hierarchies.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x or higher
- **pnpm**: v9.0.0 or higher
- **Docker & Docker Compose**: For containerized deployment and infrastructure
- **PostgreSQL**: v15+ (if running locally without Docker)

---

## ⚡ Quick Start (Docker)

To spin up the entire stack (Infrastructure + Microservices) using Docker:

```bash
# Navigate to the infra directory
cd infra/docker

# Build and start all services
docker compose up --build
```

The application will be available at `http://localhost:3000`.

---

## 💻 Local Development (Without Docker)

If you prefer to run the microservices locally while keeping infrastructure in Docker:

### 1. Start Infrastructure

```bash
# Start only the core infrastructure (Redis, RabbitMQ, MinIO)
cd infra/docker
docker compose up -d redis rabbitmq minio
```

### 2. Configure Environment

```bash
# In the root directory
cp .env.example .env
# Update the .env file with your local credentials
```

### 3. Install & Start

```bash
pnpm install
pnpm run dev
```

---

## 🔌 Service Ports

| Service                 | Internal Port | External Port |
| :---------------------- | :------------ | :------------ |
| **API Gateway**         | 80            | 3000          |
| **Dashboard UI**        | 5173          | 5173          |
| **Server Service**      | 3004          | 3004          |
| **Asset Service**       | 3001          | 3001          |
| **Metadata Service**    | 3002          | 3002          |
| **Usage Service**       | 3003          | 3003          |
| **Worker Service**      | 3005          | 3005          |
| **MinIO Console**       | 9001          | 9001          |
| **RabbitMQ Management** | 15672         | 15672         |

---

## 📡 API Endpoints

The primary entry point is the API Gateway at `http://localhost:3000/api/v1`.

- **Auth**: `/auth`
- **Assets**: `/assets`
- **Metadata**: `/metadata`
- **Collections**: `/collections`
- **Usage/Logs**: `/usage`
- **Dashboard Stats**: `/analytics/overview`

---

## ⚙️ Worker Pipeline

AuraDAM uses an event-driven architecture for background tasks:

1. **Upload**: User uploads an assets via the Asset Service.
2. **Event**: Asset Service stores the file in MinIO and publishes an `asset_uploaded` event to RabbitMQ.
3. **Consumption**: The Worker Service consumes the event from the queue.
4. **Processing**: Worker performs analysis (checksums, duplicates check, metadata extraction).
5. **Update**: Worker updates the database and potentially triggers notification events.

---

## 📦 Building for Production

To create production-ready bundles for all apps and packages:

```bash
pnpm run build
```

Individual service Dockerfiles are located in their respective `apps/<service>/` directories.

---

## 🔑 Environment Variables

Key variables required in `.env`:

- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERS`, `DB_PASSWORD`
- `RABBITMQ_URL`: Connection string for the message broker.
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- `REDIS_HOST`, `REDIS_PORT`
- `ACCESS_TOKEN`, `REFRESH_TOKEN`: JWT secrets.

See [.env.example](file:///.env.example) for a complete list.

---

## 📂 Project Structure

```text
├── apps/
│   ├── assets/       # Asset lifecycle management
│   ├── dashboard/    # React frontend (Vite)
│   ├── metadata/     # Tags and metadata enrichment
│   ├── server/       # Core orchestrator & Auth
│   ├── usage/        # Audit logs & engagement
│   └── worker/       # Background job processor
├── packages/
│   └── shared/       # Shared models, types, and utilities
├── infra/
│   ├── docker/       # Docker Compose & configurations
│   └── gateway/      # Nginx Gateway configuration
└── turbo.json        # Turborepo configuration
```

---

## 🛡 Security

- **JWT Authentication**: Secure stateless authentication across services.
- **RBAC**: Implementation of roles (Admin, Manager, Viewer) to restrict access.
- **Data Isolation**: Each service manages its own domain logic while sharing the core data schema.
- **S3 Policies**: MinIO is configured with private buckets and presigned URLs for secure assets access.

---

## 📊 Monitoring

- **Health Checks**: Every service exposes a `/api/v1/health` endpoint.
- **Structured Logging**: Services use Winston for consistent log formatting.
- **Docker Healthchecks**: Integrated into the docker-compose for automated recovery.

---

## 📈 Scaling

- **Horizontal Scaling**: All microservices are stateless and can be scaled horizontally.
- **Worker Scaling**: Increase the number of worker replicas to handle high-volume processing tasks.
- **Queue Buffering**: RabbitMQ handles spikes in traffic by buffering events for the worker service.

---

## 🔍 Troubleshooting

- **Database Connection**: Ensure PostgreSQL is running and credentials in `.env` match.
- **RabbitMQ Unreachable**: Check if the container is healthy via `http://localhost:15672`.
- **MinIO Upload Fails**: Verify `MINIO_ENDPOINT` is correctly set (use `127.0.0.1` for local, `minio` for Docker).
- **Turbo Cache Issues**: Run `pnpm run build --force` to bypass the build cache.

---

## 🌿 Branch Strategy

- **`main`**: Production-ready code.
- **`development`**: Integration branch for new features.
- **`feature/*`**: Individual feature development branches.
- **`bugfix/*`**: Critical hotfixes.

---

## 🤝 Contribution

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

**Built with ❤️ by the AuraDAM Team.**
