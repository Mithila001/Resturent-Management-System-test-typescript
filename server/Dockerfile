# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for tsc)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create directory for uploads if they don't exist in copied public
RUN mkdir -p public/images/menu public/images/categories

# Expose port
EXPOSE 5000

# Set environment to production by default
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/src/server.js"]
