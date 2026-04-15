FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN apk add --no-cache ffmpeg
RUN pnpm --filter @dam/shared build && pnpm --filter @dam/worker build
CMD ["node", "apps/worker/dist/index.js"]
