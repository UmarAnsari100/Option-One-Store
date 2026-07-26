# Production Dockerfile for Option One Store
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5000

ENV NODE_ENV=production
CMD ["node", "server/index.js"]
