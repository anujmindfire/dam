# DAM — Digital Asset Management Platform

> A production-ready, cloud-native Digital Asset Management system built on a microservices architecture. Upload, organize, preview, approve, and distribute digital assets at scale.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Getting Started (Local Dev)](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [API Reference](#api-reference)
9. [Branch Strategy](#branch-strategy)
10. [Contribution Guidelines](#contribution-guidelines)
11. [Commit Message Convention](#commit-message-convention)
12. [Versioning](#versioning)
13. [Testing](#testing)
14. [Load & Stress Testing](#load--stress-testing)
15. [Kubernetes & DevOps](#kubernetes--devops)
16. [Troubleshooting](#troubleshooting)

---

## Overview

The DAM platform provides:

- **Asset Library** — Upload, search, filter, and manage digital files (images, videos, audio, PDFs)
- **Approval Workflow** — Multi-step review and approval with comment threads
- **Compliance Dashboard** — Track expiring assets, duplicates, and governance scores
- **Intelligence Analytics** — Usage trends, storage metrics, and compliance reports
- **Background Jobs** — Async processing via RabbitMQ workers (thumbnail gen, report gen)
- **Collections** — Group related assets into curated collections
- **Role-Based Access** — Admin / Manager / Viewer roles with route-level guards

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes (Minikube)                  │
│                                                          │
│  ┌──────────────┐    ┌─────────────────────────────────┐ │
│  │  Angular SPA │    │         API Gateway             │ │
│  │ (dashboard)  │───▶│  (Express + JWT auth + proxy)   │ │
│  └──────────────┘    └────────┬────────────────────────┘ │
│                               │                          │
│         ┌─────────────────────┼──────────────────────┐   │
│         ▼                     ▼                      ▼   │
│  ┌────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Assets   │  │     Metadata     │  │    Usage &   │  │
│  │  Service   │  │     Service      │  │  Analytics   │  │
│  └──────┬─────┘  └──────────────────┘  └──────────────┘  │
│         │                                                 │
│  ┌──────▼─────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   MinIO    │  │  PostgreSQL  │  │  Redis Cache     │  │
│  │  (storage) │  │  (database)  │  │  (list caches)   │  │
│  └────────────┘  └──────────────┘  └──────────────────┘  │
│                                                           │
│  ┌────────────┐  ┌────────────────────────────────────┐  │
│  │  RabbitMQ  │  │  Worker Service (thumbnail, report) │  │
│  └────────────┘  └────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### Services

| Service                | Port (internal) | Responsibility                       |
| ---------------------- | --------------- | ------------------------------------ |
| `server` (API Gateway) | 3000            | Auth, routing, JWT validation        |
| `assets`               | 3001            | Upload, list, delete, presigned URLs |
| `metadata`             | 3002            | Tag extraction, duplicate detection  |
| `usage`                | 3003            | Analytics, compliance, usage logs    |
| `worker`               | —               | Background jobs via RabbitMQ         |
| `dashboard`            | 80              | Angular SPA                          |

---

## Tech Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| **Frontend**  | Angular 19 (Standalone Components)        |
| **Styling**   | Tailwind CSS + CSS Variables              |
| **Backend**   | Node.js, Express, TypeScript              |
| **Database**  | PostgreSQL 16 + Sequelize ORM             |
| **Cache**     | Redis 7                                   |
| **Storage**   | MinIO (S3-compatible object storage)      |
| **Queue**     | RabbitMQ 3.12                             |
| **Container** | Docker + Kubernetes (Minikube for local)  |
| **Ingress**   | NGINX Ingress Controller                  |
| **Monorepo**  | pnpm + Nx workspace                       |
| **Testing**   | Jasmine + Karma (Angular), Jest (Node.js) |

---

## Prerequisites

```bash
# Required tools
node   >= 20.x    # https://nodejs.org
pnpm   >= 9.x     # npm install -g pnpm
docker            # https://docker.com
minikube          # https://minikube.sigs.k8s.io
kubectl           # https://kubernetes.io/docs/tasks/tools/
```

Check your versions:

```bash
node --version && pnpm --version && docker --version && minikube version && kubectl version --client
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/anujmindfire/digital-asset-management.git
cd digital-asset-management
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start Minikube

```bash
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=30g
minikube addons enable ingress
```

### 4. Add hosts entry

```bash
echo "$(minikube ip) dam.local" | sudo tee -a /etc/hosts
```

### 5. Apply Kubernetes manifests

```bash
kubectl apply -f infra/k8s/base/
kubectl apply -f infra/k8s/
```

### 6. Wait for all pods to be ready

```bash
kubectl get pods -n dam --watch
```

### 7. Access the application

Open http://dam.local:8080 in your browser.

**Default credentials:**

- Email: `admin@dam.com`
- Password: `Admin1234`

---

## Environment Variables

All secrets are managed via `infra/k8s/base/secrets.yml`.

| Variable           | Description             | Example                            |
| ------------------ | ----------------------- | ---------------------------------- |
| `DB_HOST`          | PostgreSQL host         | `postgres`                         |
| `DB_NAME`          | Database name           | `dam`                              |
| `DB_USER`          | DB username             | `postgres`                         |
| `DB_PASSWORD`      | DB password             | (secret)                           |
| `REDIS_URL`        | Redis connection URL    | `redis://redis:6379`               |
| `RABBITMQ_URL`     | RabbitMQ AMQP URL       | `amqp://guest:guest@rabbitmq:5672` |
| `MINIO_ENDPOINT`   | MinIO host              | `minio`                            |
| `MINIO_ACCESS_KEY` | MinIO access key        | `minioadmin`                       |
| `MINIO_SECRET_KEY` | MinIO secret key        | (secret)                           |
| `MINIO_PUBLIC_URL` | Public-facing MinIO URL | `http://dam.local:8080/minio`      |
| `JWT_SECRET`       | JWT signing secret      | (secret)                           |
| `APP_URL`          | API gateway public URL  | `http://dam.local:8080`            |
| `CLIENT_URL`       | Frontend origin         | `http://dam.local:8080`            |

> ⚠️ **Never commit real secrets to Git.** Use `kubectl create secret` or a secrets manager in production.

---

## Running the Application

### Local development (TypeScript watch mode)

```bash
pnpm dev          # starts all services with ts-node --watch
```

### Build all packages

```bash
pnpm build        # builds shared, then all apps
```

### Build Docker images (inside Minikube's Docker daemon)

```bash
eval $(minikube docker-env)
docker build -f apps/dashboard/Dockerfile -t dam-dashboard:latest .
docker build -f apps/assets/Dockerfile    -t dam-assets:latest .
docker build -f apps/server/Dockerfile   -t dam-server:latest .
# ... repeat for other services
```

### Rollout after image rebuild

```bash
kubectl rollout restart deployment/dashboard-ui deployment/assets -n dam
kubectl rollout status  deployment/dashboard-ui deployment/assets -n dam
```

### Seed usage analytics data (for dashboard chart)

```bash
PGPASSWORD=<password> psql -h localhost -U postgres -d dam -f scripts/seed-usage.sql
```

---

## API Reference

Base URL: `http://dam.local:8080/api/v1`

### Auth

| Method | Endpoint       | Description                        |
| ------ | -------------- | ---------------------------------- |
| POST   | `/auth/login`  | Obtain JWT access + refresh tokens |
| POST   | `/auth/signup` | Create new user account            |
| POST   | `/auth/logout` | Invalidate session                 |

### Assets

| Method | Endpoint                      | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| GET    | `/assets`                     | List all assets (paginated)     |
| GET    | `/assets/:id`                 | Get single asset                |
| POST   | `/assets/upload/presignedUrl` | Get MinIO presigned upload URL  |
| POST   | `/assets/upload/complete`     | Finalize upload metadata        |
| GET    | `/assets/:id/thumbnail`       | Authenticated thumbnail stream  |
| GET    | `/assets/:id/download`        | Generate presigned download URL |
| DELETE | `/assets/:id`                 | Delete asset + MinIO object     |

### Analytics

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/analytics/overview`       | Dashboard stats + usage trends       |
| GET    | `/analytics/compliance`     | Compliance score + violations        |
| GET    | `/analytics/report`         | Latest generated report              |
| POST   | `/analytics/report/trigger` | Trigger background report generation |

### Collections

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| GET    | `/collection`     | List all collections    |
| POST   | `/collection`     | Create collection       |
| GET    | `/collection/:id` | Get collection + assets |
| DELETE | `/collection/:id` | Delete collection       |

### Approvals

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| GET    | `/approval`             | List pending approvals |
| POST   | `/approval/:id/approve` | Approve asset          |
| POST   | `/approval/:id/reject`  | Reject asset           |

---

## Branch Strategy

This project follows **GitHub Flow** with semantic branch naming:

```
main          ← production-ready code, protected
develop       ← integration branch for feature PRs
feat/*        ← new features    e.g. feat/bulk-delete
fix/*         ← bug fixes       e.g. fix/minio-delete
chore/*       ← maintenance     e.g. chore/update-deps
docs/*        ← documentation   e.g. docs/api-reference
perf/*        ← performance     e.g. perf/lazy-routes
test/*        ← test additions  e.g. test/asset-service
```

### Rules

- **Never push directly to `main`** — all changes go through PRs
- All PRs must target `develop`, not `main`
- `main` ← `develop` merges happen on release only (squash merge)
- Branch names must follow the pattern: `<type>/<short-description>`

---

## Contribution Guidelines

1. **Fork** the repository (external contributors) or **branch** from `develop`
2. Follow the [branch naming convention](#branch-strategy)
3. Write or update tests for all changed functionality
4. Ensure `pnpm build` and `pnpm lint` pass before opening a PR
5. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely
6. Request at least **1 reviewer** before merging
7. Squash-merge PRs into `develop`

---

## Commit Message Convention

This project uses **[Conventional Commits](https://www.conventionalcommits.org/)** enforced by `commitlint` and `husky`.

### Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to use                        |
| ---------- | ---------------------------------- |
| `feat`     | A new feature                      |
| `fix`      | A bug fix                          |
| `docs`     | Documentation only                 |
| `style`    | Formatting, no logic change        |
| `refactor` | Code restructuring, no feature/fix |
| `perf`     | Performance improvement            |
| `test`     | Adding or fixing tests             |
| `chore`    | Build, tooling, CI/CD              |
| `ci`       | GitHub Actions / CI changes        |

### Examples

```bash
feat(assets): add MinIO cleanup on delete
fix(dashboard): bust analytics cache on asset deletion
perf(routes): convert all page routes to lazy-loaded
test(pipes): add unit tests for FileSizePipe and RelativeTimePipe
docs: add full README with API reference and branch strategy
chore(deps): bump @angular/core to 19.3.0
```

### Breaking Changes

Append `!` after the type or add `BREAKING CHANGE:` footer:

```bash
feat!: change asset delete to also remove MinIO object

BREAKING CHANGE: DELETE /assets/:id now also removes the MinIO file.
```

---

## Versioning

This project uses **[Semantic Versioning](https://semver.org/)** (`MAJOR.MINOR.PATCH`):

| Part    | When to bump                      |
| ------- | --------------------------------- |
| `MAJOR` | Breaking API or behavioral change |
| `MINOR` | New feature, backward-compatible  |
| `PATCH` | Bug fix, backward-compatible      |

Current version: see `package.json` root `"version"` field.

### Release Process

```bash
# 1. Merge develop → main (squash)
# 2. Tag the release
git tag -a v1.2.0 -m "release: v1.2.0"
git push origin v1.2.0
# 3. Update CHANGELOG.md
```

---

## Testing

### Run Angular unit tests

```bash
cd apps/dashboard
pnpm test          # Karma + Jasmine (headless Chrome)
```

### Run backend tests

```bash
cd apps/server
pnpm test          # Jest
```

### Run all tests

```bash
pnpm test          # from monorepo root
```

### Test coverage targets

| Layer           | Target |
| --------------- | ------ |
| Pipes           | 100%   |
| Guards          | 100%   |
| Services (HTTP) | ≥ 80%  |
| Components      | ≥ 60%  |

---

## Load & Stress Testing

The stress test simulates 10 concurrent upload workers for 60 seconds to trigger HPA autoscaling:

```bash
bash scripts/stress-test.sh
```

What it does:

1. Authenticates and gets a JWT token
2. Auto-selects a test file from `test-media/`
3. Launches 10 parallel upload workers for 60 seconds
4. Monitors HPA scaling every 10 seconds
5. Scales workers back to 2 after completion

**Prerequisites**: Files in `test-media/` directory (`.jpg`, `.webp`, `.mp4`)

---

## Kubernetes & DevOps

### Check cluster status

```bash
kubectl get pods -n dam
kubectl get services -n dam
kubectl get hpa -n dam
```

### View logs

```bash
kubectl logs deployment/assets    -n dam --follow
kubectl logs deployment/dashboard-ui -n dam --follow
kubectl logs deployment/worker    -n dam --follow
```

### Scale services manually

```bash
kubectl scale deployment/worker -n dam --replicas=5
```

### Flush Redis cache

```bash
kubectl exec -n dam deployment/redis -- redis-cli FLUSHDB
```

### MinIO console

```bash
kubectl port-forward svc/minio -n dam 9001:9001
# Open http://localhost:9001 (minioadmin / minioadmin)
```

### Grafana monitoring

```bash
kubectl port-forward svc/grafana -n monitoring 3000:3000
# Open http://localhost:3000 (admin / admin)
```

---

## Troubleshooting

### "Not Found" on asset download

**Cause**: `MINIO_PUBLIC_URL` pointing to port 80 (Apache) instead of port 8080 (Ingress).  
**Fix**: Verify `infra/k8s/base/secrets.yml` has `http://dam.local:8080/minio`.

### Deleted asset reappears after refresh

**Cause**: Redis list cache not invalidated.  
**Fix**: Run `kubectl exec -n dam deployment/redis -- redis-cli FLUSHDB` to clear all caches.

### Dashboard chart is empty

**Cause**: No data in the `usage` table.  
**Fix**: Run `scripts/seed-usage.sql` to seed 7 days of usage data.

### Pods not starting

```bash
kubectl describe pod <pod-name> -n dam   # check events
kubectl logs <pod-name> -n dam           # check logs
```

### Build fails

```bash
pnpm install --frozen-lockfile   # ensure lockfile is clean
pnpm build                       # rebuild all packages
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
