#syntax=docker/dockerfile:1.4

# ---------------------------
# Versions
# ---------------------------
# FROM node:21-alpine AS node_upstream
FROM node@sha256:78c45726ea205bbe2f23889470f03b46ac988d14b6d813d095e2e9909f586f93 AS node_upstream


# Base stage for dev and build
FROM node_upstream AS base

# Installer les dépendances nécessaires
# RUN apk add --no-cache libc6-compat
RUN apk add --no-cache gcompat=1.1.0-r4

WORKDIR /srv/app

# Activer Corepack et installer PNPM figé
# RUN corepack enable && corepack prepare --activate pnpm@8.13.1 && \
#     pnpm config -g set store-dir /.pnpm-store
RUN corepack enable && corepack prepare --activate pnpm@9 \
    && pnpm config -g set store-dir /.pnpm-store

# Désactiver la télémétrie Next.js
ENV NEXT_TELEMETRY_DISABLED=1


# ---------------------------
# Development image
# ---------------------------
FROM base AS dev
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME localhost

CMD ["sh", "-c", "pnpm install; pnpm dev"]


# ---------------------------
# Builder image
# ---------------------------
FROM base AS builder

# Copier le lockfile pour tirer parti du cache Docker
COPY --link pnpm-lock.yaml package.json ./
RUN pnpm fetch --prod

# Copier le reste du projet
COPY --link . .

# Variables d’arguments pour build
ARG AUTH_SECRET
ARG NEXT_PUBLIC_OIDC_SERVER_URL

RUN	pnpm install --frozen-lockfile --offline --prod && \
	pnpm run build

# ---------------------------
# Production image
# ---------------------------
# FROM node_upstream AS prod
FROM base AS prod

WORKDIR /srv/app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs; \
	adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next; \
	chown nextjs:nodejs .next

USER nextjs

COPY --from=builder --link /srv/app/public ./public
COPY --from=builder --link --chown=1001:1001 /srv/app/.next/standalone ./
COPY --from=builder --link --chown=1001:1001 /srv/app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
