# Multi-stage build for production optimization
FROM --platform=linux/amd64 node:18-alpine as builder

# Define build arguments
ARG REACT_APP_OPENAI_API_KEY
ARG YANDEX_FOLDER_ID
ARG YANDEX_SEARCH_API_KEY

# Set environment variables from build args
ENV REACT_APP_OPENAI_API_KEY=$REACT_APP_OPENAI_API_KEY
ENV YANDEX_FOLDER_ID=$YANDEX_FOLDER_ID
ENV YANDEX_SEARCH_API_KEY=$YANDEX_SEARCH_API_KEY

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Production stage
FROM --platform=linux/amd64 node:18-alpine as production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and server.js
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs server.js ./

# Install production dependencies (needed for server.js)
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/build ./build

# Set production environment
ENV NODE_ENV=production

# Switch to non-root user
USER nextjs

# Expose port 8080 (YC Serverless Container default)
EXPOSE 8080

# Health check - check both static and API
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/test || exit 1

# Start the Node.js server (not serve)
CMD ["node", "server.js"]
