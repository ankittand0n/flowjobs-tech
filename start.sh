#!/bin/bash

docker compose -f compose.dev.yml.old up minio chrome -d && pnpm dev
