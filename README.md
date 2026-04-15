# Digital Asset Management & Media Intelligence Platform

A highly scalable monorepo for managing digital assets, metadata, user permissions, and executing background media processing tasks.

## Architecture

This project is structured as a **Turborepo** monorepo using **pnpm**, strictly following the service-based structure defined below:

- `apps/gateways`: The main API Gateway/Orchestrator.
- `packages/api-service`: The core API backend interacting with clients and providing Swagger documentation.
- `packages/server`: The background processing logic mapping to Asset Lifecycle.
- `packages/queue`: Shared configuration for distributed queues (e.g., BullMQ).
- `packages/ui`: The main React (Vite) frontend application.
- `packages/shared`: Sequelize database models, common interfaces, and configuration.

## Tooling

This repository incorporates strict static analysis and testing:

- **Husky & lint-staged**: Validates formatting and standard patterns locally on commit.
- **ESLint & Prettier**: Base code quality tools shared across nodes.
- **Jest**: Shared and component-specific unit testing framework.
- **Swagger**: Endpoints described dynamically inside `api-service`.

## Getting Started

1. Set up Node 20.x and `pnpm`.
2. Run `pnpm install` in the repository root.
3. Start the entire stack in dev mode with: `pnpm run dev`.

## Services Deployment

Docker configurations target the explicit services stored in `packages/`.
