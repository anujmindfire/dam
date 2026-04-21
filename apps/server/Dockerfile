FROM node:20-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm tsc -b --clean && pnpm tsc -b
RUN cp apps/server/src/swagger.json apps/server/dist/swagger.json
EXPOSE 3000
CMD ["node", "apps/server/dist/index.js"]
