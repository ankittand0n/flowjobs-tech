#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# Function to wait for a service
wait_for_service() {
    local service=$1
    local max_attempts=$2
    local attempt=1
    
    echo -e "${YELLOW}Waiting for $service to be ready...${NC}"
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps $service | grep -q "running"; then
            echo -e "${GREEN}✓ $service is running${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    echo -e "\n${RED}✗ $service failed to start${NC}"
    return 1
}

echo "🚀 Starting FlowJobs Tech System Check..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi
print_status "Environment file found"

# Check if docker compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}✗ docker compose is not installed${NC}"
    exit 1
fi
print_status "Docker Compose is installed"

# Stop any running containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker compose down
print_status "Existing containers stopped"

# Start the services
echo -e "${YELLOW}Starting services...${NC}"
docker compose up -d
print_status "Services started"

# Wait for MinIO to be healthy
wait_for_service "minio" 30
print_status "MinIO service is healthy"

# Wait for MinIO initialization to complete
echo -e "${YELLOW}Waiting for MinIO initialization...${NC}"
sleep 15
print_status "MinIO initialization completed"

# Test MinIO connectivity
echo -e "${YELLOW}Testing MinIO connectivity...${NC}"
if docker compose exec minio mc ls myminio/default &> /dev/null; then
    print_status "MinIO bucket is accessible"
else
    echo -e "${RED}✗ MinIO bucket is not accessible${NC}"
    exit 1
fi

# Test MinIO public access
echo -e "${YELLOW}Testing MinIO public access...${NC}"
if docker compose exec minio mc policy get myminio/default | grep -q "public"; then
    print_status "MinIO bucket has public access"
else
    echo -e "${RED}✗ MinIO bucket does not have public access${NC}"
    exit 1
fi

# Test MinIO bucket policy
echo -e "${YELLOW}Testing MinIO bucket policy...${NC}"
if docker compose exec minio mc admin policy list myminio | grep -q "public-read-policy"; then
    print_status "MinIO public-read policy is set"
else
    echo -e "${RED}✗ MinIO public-read policy is not set${NC}"
    exit 1
fi

# Test MinIO file operations with public access
echo -e "${YELLOW}Testing MinIO file operations with public access...${NC}"
echo "test" | docker compose exec -T minio mc pipe myminio/default/test.txt
if curl -s "http://localhost:9000/default/test.txt" | grep -q "test"; then
    print_status "MinIO public file access is working"
else
    echo -e "${RED}✗ MinIO public file access is not working${NC}"
    exit 1
fi

# Clean up test file
docker compose exec minio mc rm myminio/default/test.txt
print_status "Test file cleaned up"

# Wait for Chrome service
wait_for_service "chrome" 15
print_status "Chrome service is running"

# Wait for app service
wait_for_service "app" 30
print_status "App service is running"

# Test app health
echo -e "${YELLOW}Testing app health...${NC}"
if curl -s http://localhost:3000/api/health &> /dev/null; then
    print_status "App health check passed"
else
    echo -e "${RED}✗ App health check failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}✨ All systems are operational!${NC}"
echo -e "\nAccess points:"
echo -e "  App: ${GREEN}https://flowjobs.tech${NC}"
echo -e "  MinIO Console: ${GREEN}https://flowjobs.tech:9001${NC}"
echo -e "  MinIO API: ${GREEN}https://flowjobs.tech:9000${NC}"

# Print container status
echo -e "\nContainer Status:"
docker compose ps 