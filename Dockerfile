FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

RUN npm ci
RUN npx prisma generate

FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/prisma.config.ts ./
COPY --from=deps /app/tsconfig.json ./
COPY --from=deps /app/tsconfig.build.json ./
COPY --from=deps /app/nest-cli.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node dist/main"]
