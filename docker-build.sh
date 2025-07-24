#!/bin/bash

# Docker Build Script for Yazeka app
set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

echo "🐳 Building Yazeka app Docker Image..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t yazeka-app \
  --build-arg REACT_APP_OPENAI_API_KEY="${REACT_APP_OPENAI_API_KEY}" \
  --build-arg REACT_APP_OPENAI_BASE_URL="${REACT_APP_OPENAI_BASE_URL}" \
  --build-arg YANDEX_FOLDER_ID="${YANDEX_FOLDER_ID}" \
  --build-arg YANDEX_SEARCH_API_KEY="${YANDEX_SEARCH_API_KEY}" \
  .

echo -e "${YELLOW}🏷️ Tagging image for registry...${NC}"
docker tag yazeka-app ${YC_REGISTRY}:latest

echo -e "${YELLOW}📤 Pushing to Yandex Container Registry...${NC}"
docker push ${YC_REGISTRY}:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    echo -e "${GREEN}🚀 To run the container:${NC}"
    echo "   docker run -p 3000:3000 -p 3001:3001 --env-file .env yazeka-app:latest"
    echo ""
    echo -e "${YELLOW}📋 Available Docker commands:${NC}"
    echo "   • Run container: docker run -p 3000:3000 -p 3001:3001 --env-file .env yazeka-app:latest"
    echo "   • Run in background: docker run -d -p 3000:3000 -p 3001:3001 --env-file .env yazeka-app:latest"
    echo "   • Stop container: docker stop <container_id>"
    echo "   • View images: docker images"
    echo "   • Remove image: docker rmi yazeka-app:latest"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}🚀 Deploying to Yandex Cloud Serverless Container...${NC}"
yc serverless container revision deploy \
  --container-name ${YC_CONTAINER} \
  --image ${YC_REGISTRY}:latest \
  --cores 1 \
  --memory 1GB \
  --concurrency 1 \
  --execution-timeout 30s \
  --service-account-id ${YC_SERVICE_ACCOUNT} \
  --environment 'REACT_APP_OPENAI_API_KEY='${REACT_APP_OPENAI_API_KEY} \
  --environment 'REACT_APP_OPENAI_BASE_URL='${REACT_APP_OPENAI_BASE_URL} \
  --environment 'YANDEX_FOLDER_ID='${YANDEX_FOLDER_ID} \
  --environment 'YANDEX_SEARCH_API_KEY='${YANDEX_SEARCH_API_KEY}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${GREEN}📱 Your app is now live on Yandex Cloud!${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi