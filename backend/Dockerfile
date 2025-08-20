FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm i --no-save esbuild && npm run build

FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json ./package.json
RUN adduser -D -H nodeuser && chown -R nodeuser:nodeuser /app
USER nodeuser
EXPOSE 5000
ENV STORAGE_DIR=/app/uploads
RUN mkdir -p "$STORAGE_DIR"
CMD ["node", "dist/server.js"]


