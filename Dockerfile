# Stage 1: Build the Angular app
FROM node:24-alpine AS build

# Use a dedicated app directory inside the container
WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./
# Install all dependencies (including dev) in the build stage so the Angular CLI
# and build tooling are available to run `ng build`. The final image will only
# contain the built static files copied into the nginx image.
RUN npm ci

# Copy entire repo into /app and build the Angular app
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/game-of-life/browser /usr/share/nginx/html

# Copy entrypoint script that will generate env.js at container startup
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
