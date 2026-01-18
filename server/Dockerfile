# Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directory for uploads
RUN mkdir -p public/images/menu public/images/categories

# Expose port
EXPOSE 5000

# Set environment to production by default
ENV NODE_ENV=production

# Start server
CMD ["node", "src/server.js"]
