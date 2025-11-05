# Stage 1: Build the Angular app
FROM node:24-alpine AS build

# Use a dedicated app directory inside the container
WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./
RUN npm install

# Copy entire repo into /app and build the Angular app
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/game-of-life/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
