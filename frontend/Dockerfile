# Stage 1: Build Vite static distribution
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install frontend dependencies
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Build Vite application for production
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled frontend build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx webserver
CMD ["nginx", "-g", "daemon off;"]
