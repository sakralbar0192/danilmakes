FROM node:20-alpine AS builder

WORKDIR /app

COPY server/package.json ./
RUN npm install

COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY server/package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY server/src/db/migrations ./dist/db/migrations
COPY demos/tariff-prices/src/mocks/fixtures ./fixtures/tariffs

ENV DEMO_TARIFF_FIXTURES=/app/fixtures/tariffs

EXPOSE 3000

CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
