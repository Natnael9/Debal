FROM node:20-slim

# Install system dependencies required for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install npm dependencies
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 4000

# Start server
CMD ["node", "index.js"]
