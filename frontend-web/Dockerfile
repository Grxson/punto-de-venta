# Use Node.js 20 Alpine for smaller image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve for production static file serving
RUN npm install -g serve

# Copy built files only (no node_modules needed)
COPY --from=builder /app/dist ./dist

# Railway uses PORT env variable
ENV PORT=8080
EXPOSE 8080

# Use serve for production (more reliable than vite preview)
CMD ["sh", "-c", "serve -s dist -l $PORT"]
