# Use the official MinIO image from Docker Hub
FROM minio/minio:latest

# Set environment variables
ENV MINIO_ROOT_USER=minioadmin
ENV MINIO_ROOT_PASSWORD=minioadmin
ENV MINIO_BROWSER=on
ENV MINIO_DOMAIN=localhost
ENV MINIO_REGION=us-east-1
ENV MINIO_SITE_REGION=us-east-1

# Create default bucket directory
RUN mkdir -p /data/default

# Expose MinIO API and Console ports
EXPOSE 9000 9001

# Set up healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9000/minio/health/live || exit 1

# Set the entrypoint for MinIO
ENTRYPOINT ["minio"]
CMD ["server", "/data", "--console-address", ":9001"]
