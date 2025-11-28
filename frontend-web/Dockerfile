# Use Node.js 22 Alpine (Vite requires 20.19+ or 22.12+)
FROM node:22-alpine AS builder

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

# Production stage - use nginx for better static file serving
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx config template that uses PORT env variable
RUN echo 'server { \
    listen ${PORT}; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        return 200 "OK"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/templates/default.conf.template

# Default port
ENV PORT=8080
EXPOSE 8080

# Start nginx (envsubst will replace ${PORT} automatically)
CMD ["nginx", "-g", "daemon off;"]
