FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
ENV NODE_ENV=production VITE_API_URL=/api/v1
RUN pnpm --filter @dam/dashboard build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/apps/dashboard/dist /app/dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
