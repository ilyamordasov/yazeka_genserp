# Multi-stage build for production optimization
FROM --platform=linux/amd64 node:18-alpine as builder

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

# Install serve globally
RUN npm install -g serve

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/build ./build

# Switch to non-root user
USER nextjs

# Expose port 8080 (YC Serverless Container default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

# Start the application
CMD ["serve", "-s", "build", "-l", "8080"]
