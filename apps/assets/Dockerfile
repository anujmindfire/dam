FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm --filter @dam/shared build && pnpm --filter @dam/asset build
EXPOSE 3001
CMD ["node", "apps/assets/dist/index.js"]
