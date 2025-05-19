# Use a slimmer Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests and install only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of your source
COPY . .

# Explicitly declare the PORT env var that Cloud Run injects
ENV PORT=8080

# Expose the listening port
EXPOSE 8080

# Start your server
CMD ["npm", "start"]

