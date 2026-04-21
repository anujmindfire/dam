FROM node:20-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
EXPOSE 5173
CMD ["pnpm", "--filter", "@dam/dashboard", "dev", "--host"]
