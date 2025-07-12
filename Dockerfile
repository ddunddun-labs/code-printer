# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application from a lightweight server
FROM node:18-alpine
WORKDIR /app
# Copy the build output from the builder stage
COPY --from=builder /app/build ./build
# Copy package.json and package-lock.json to install only production dependencies
COPY package.json ./
COPY package-lock.json ./
# Install production dependencies (which includes 'serve')
RUN npm install --omit=dev
# Expose the port the server will run on. Cloud Run uses 8080 by default.
EXPOSE 8080
# Start the server
CMD ["npx", "serve", "-s", "build", "-l", "8080"]