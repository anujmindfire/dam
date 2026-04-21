FROM node:20-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++ ffmpeg
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm tsc -b --clean && pnpm tsc -b
CMD ["node", "apps/worker/dist/index.js"]
