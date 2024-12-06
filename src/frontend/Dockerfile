# Stage 1: Build the frontend
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source code from the local directory to the container
COPY . .

# Run the build command to generate production-ready files
RUN npm run build

# Stage 2: Serve the frontend
FROM nginx:alpine

# Copy the nginx.conf to the Nginx configuration directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the "build" stage to the Nginx web server's default directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to serve the frontend
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]