FROM node:20-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm tsc -b --clean && pnpm tsc -b
EXPOSE 3001
CMD ["node", "apps/assets/dist/index.js"]
