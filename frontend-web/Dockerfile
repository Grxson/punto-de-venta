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

# Inyectar variables de entorno para build
# En Railway estas variables se pasan via ENV en docker build
ARG VITE_API_URL_PROD=${VITE_API_URL_PROD:-https://punto-de-venta-production-d424.up.railway.app/api}
ARG VITE_API_URL_STAGING=${VITE_API_URL_STAGING:-https://punto-de-venta-staging.up.railway.app/api}
ARG VITE_API_TIMEOUT=${VITE_API_TIMEOUT:-30000}
ARG VITE_API_RETRIES=${VITE_API_RETRIES:-3}
ARG VITE_APP_ENV=${VITE_APP_ENV:-production}

# Exportar variables de entorno para npm run build
ENV VITE_API_URL_PROD=${VITE_API_URL_PROD}
ENV VITE_API_URL_STAGING=${VITE_API_URL_STAGING}
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT}
ENV VITE_API_RETRIES=${VITE_API_RETRIES}
ENV VITE_APP_ENV=${VITE_APP_ENV}

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
