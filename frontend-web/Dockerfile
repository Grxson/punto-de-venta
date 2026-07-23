FROM node:22-alpine AS builder
WORKDIR /app
# Force cache bust - timestamp: $(date)
COPY package*.json ./
RUN npm install --no-cache
COPY . ./
RUN npm run build:prod

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
