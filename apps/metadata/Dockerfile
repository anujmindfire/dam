FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm --filter @dam/shared build && pnpm --filter @dam/metadata build
EXPOSE 3002
CMD ["node", "apps/metadata/dist/index.js"]
