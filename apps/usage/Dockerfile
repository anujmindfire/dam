FROM node:20-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm tsc -b --clean && pnpm tsc -b
EXPOSE 3003
CMD ["node", "apps/usage/dist/index.js"]
