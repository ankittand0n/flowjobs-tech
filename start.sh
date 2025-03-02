#!/bin/bash

docker compose -f compose.dev.yml up minio chrome -d && pnpm dev