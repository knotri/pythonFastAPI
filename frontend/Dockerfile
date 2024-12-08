# Step 1: Build the Angular application
FROM node:18 AS build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . ./

# Build the Angular application
RUN npm run build

# Step 2: Serve the Angular application
FROM node:18

# Install a lightweight HTTP server for serving Angular apps
RUN npm install -g http-server

# Set working directory
WORKDIR /app

# Copy the build output from the build stage
COPY --from=build-stage /app/dist/frontend /app

# Expose port 4200
EXPOSE 4200

# Start the Angular application
CMD ["http-server", "./browser", "-p", "4200", "-a", "0.0.0.0"]
