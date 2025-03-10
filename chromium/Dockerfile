# Use the official browserless/chromium image
FROM ghcr.io/browserless/chromium:latest

# Set environment variables
ENV CHROME_IGNORE_HTTPS_ERRORS=true
ENV CHROME_MAX_RETRIES=10
ENV CONNECTION_TIMEOUT=60000
ENV HOST=0.0.0.0
ENV PORT=8080
ENV WORKSPACE_DELETE_EXPIRED=true
ENV WORKSPACE_EXPIRE_DAYS=1
ENV ENABLE_DEBUGGER=true
ENV FUNCTION_ENABLE_INCOGNITO_MODE=true
ENV DISABLE_AUTO_SET_DOWNLOAD_BEHAVIOR=true
ENV DEFAULT_BLOCK_ADS=true
ENV CHROME_REFRESH_TIME=3600000
ENV EXIT_ON_HEALTH_FAILURE=true
ENV PREBOOT_CHROME=true
ENV KEEP_ALIVE=true

# PDF-specific settings
ENV PDF_ENABLE_CHROME_PDF=true
ENV FUNCTION_ENABLE_FILE_DOWNLOADS=true
ENV ENABLE_XVFB=true
ENV CHROME_HEADLESS_MODE=new
ENV DEFAULT_LAUNCH_ARGS='["--window-size=1920,1080","--font-render-hinting=none"]'
ENV WORKSPACE_DIR=/tmp/workspace
ENV ENABLE_CORS=true
ENV MAX_CONCURRENT_SESSIONS=10
ENV CHROME_REFRESH_TIME=3600000
ENV FUNCTION_BUILT_INS='["pdf"]'
ENV ENABLE_ROUTES='["pdf"]'

# Create and set permissions for workspace directory
USER root
RUN mkdir -p /tmp/workspace && \
    chmod -R 777 /tmp/workspace && \
    mkdir -p /dev/shm && \
    chmod -R 777 /dev/shm
USER blessuser

# Expose the port
EXPOSE 8080

# The image already has a proper healthcheck and entrypoint configured 