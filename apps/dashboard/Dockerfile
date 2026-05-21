FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY apps/dashboard/dist/dashboard/browser /app/dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
