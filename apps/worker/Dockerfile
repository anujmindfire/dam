FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN apk update && apk add --no-cache ffmpeg
RUN pnpm tsc -b --clean && pnpm tsc -b
CMD ["node", "apps/worker/dist/index.js"]
