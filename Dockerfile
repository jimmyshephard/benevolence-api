# Stage 1 - install dependencies and compile
FROM node:24-alpine AS base

RUN npm i -g pnpm@11

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

# Stage 2 - production runtime environment
FROM node:24-alpine AS production

WORKDIR /app

COPY --from=base /app ./

EXPOSE 3000

CMD ["node", "src/index.js"]
