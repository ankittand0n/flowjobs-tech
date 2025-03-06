ARG NX_CLOUD_ACCESS_TOKEN

# --- Base Image ---
FROM node:lts-bullseye-slim AS base
ARG NX_CLOUD_ACCESS_TOKEN

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# --- Build Image ---
FROM base AS build
ARG NX_CLOUD_ACCESS_TOKEN

COPY .npmrc package.json pnpm-lock.yaml ./
COPY ./tools/prisma /app/tools/prisma
RUN pnpm install --frozen-lockfile

COPY . .

ENV NX_CLOUD_ACCESS_TOKEN=$NX_CLOUD_ACCESS_TOKEN

RUN pnpm run build

# --- Release Image ---
FROM base AS release
ARG NX_CLOUD_ACCESS_TOKEN

# Install MinIO and its dependencies
RUN apt update && \
    apt install -y \
    dumb-init \
    wget \
    curl \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    wget --no-check-certificate https://dl.min.io/server/minio/release/linux-amd64/minio && \
    chmod +x minio && \
    mv minio /usr/local/bin/ && \
    mkdir -p /data && \
    chown -R node:node /data && \
    chmod -R 755 /data

# Set Chrome environment variables
ENV CHROME_URL=ws://localhost:8080
ENV CHROME_TOKEN=0a10d4c4a8db4842616bc41470b3a21470dd5ed5090b47b6e3676a7524117231
ENV CHROME_IGNORE_HTTPS_ERRORS=true

COPY --chown=node:node --from=build /app/.npmrc /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/tools/prisma ./tools/prisma
RUN pnpm run prisma:generate

ENV TZ=UTC
ENV PORT=3000
ENV NODE_ENV=production

ENV MINIO_ROOT_USER=minioadmin
ENV MINIO_ROOT_PASSWORD=minioadmin

EXPOSE 3000
EXPOSE 9000

# Create startup script with better error handling
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Ensure data directory permissions\n\
chown -R node:node /data\n\
chmod -R 755 /data\n\
\n\
# Function to check if MinIO is ready\n\
check_minio() {\n\
    curl -s http://localhost:9000/minio/health/live > /dev/null\n\
    return $?\n\
}\n\
\n\
# Start MinIO\n\
minio server /data &\n\
\n\
# Wait for MinIO to be ready\n\
echo "Waiting for MinIO to start..."\n\
for i in {1..30}; do\n\
    if check_minio; then\n\
        echo "MinIO is ready!"\n\
        break\n\
    fi\n\
    sleep 1\n\
done\n\
\n\
# Start the application with proper Node.js environment\n\
export NODE_ENV=production\n\
export PORT=3000\n\
\n\
echo "Starting the application..."\n\
exec dumb-init --single-child pnpm run start' > /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh

# Switch to non-root user
USER node

CMD [ "/usr/local/bin/start.sh" ]