#!/bin/bash

# Production Deployment Script
set -e

echo "🚀 Starting production deployment..."

# Create production environment
cat > .env.production << EOF
NODE_ENV=production
PORT=5000
CLIENT_URL=https://surprisemoments.com
DB_HOST=postgres
DB_PORT=5432
DB_NAME=surprise_moments_prod
DB_USER=surprise_user
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -base64 32)
CORS_ORIGIN=https://surprisemoments.com
REACT_APP_API_URL=https://api.surprisemoments.com/api
REACT_APP_ENVIRONMENT=production
EOF

# Create production docker-compose
cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: surprise_moments_prod
      POSTGRES_USER: surprise_user
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    env_file: .env.production
    volumes:
      - ./server/assets:/app/assets:ro
      - ./server/uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    networks:
      - app-network

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    env_file: .env.production
    depends_on:
      - server
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - client
      - server
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
EOF

# Deploy
docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Production deployment completed!"
