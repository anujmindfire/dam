FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm --filter @dam/dashboard build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
# Angular build output path usually apps/dashboard/dist/dashboard/browser
COPY --from=builder /app/apps/dashboard/dist/dashboard/browser /app/dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
