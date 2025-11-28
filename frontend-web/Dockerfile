# Dockerfile for Railway - Frontend Web v1.0.2
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

# Asegurar que .env.production existe con las variables correctas
# Vite leerá .env.production automáticamente durante npm run build
RUN echo "VITE_API_URL=https://punto-de-venta-production-d424.up.railway.app" > .env.production && \
    echo "VITE_API_URL_PROD=https://punto-de-venta-production-d424.up.railway.app/api" >> .env.production && \
    echo "VITE_API_URL_STAGING=https://punto-de-venta-staging.up.railway.app/api" >> .env.production && \
    echo "VITE_API_TIMEOUT=30000" >> .env.production && \
    echo "VITE_API_RETRIES=3" >> .env.production && \
    echo "VITE_APP_ENV=production" >> .env.production

# Build the application (Vite leerá .env.production automáticamente)
RUN npm run build

# Production stage - use nginx for static file serving
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx config that handles SPA routing and health endpoint
RUN printf 'server {\n\
    listen 8080;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location /health {\n\
        return 200 "OK";\n\
        add_header Content-Type text/plain;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Expose port 8080 (Railway default)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
