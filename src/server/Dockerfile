FROM node:24-alpine

# Use a dedicated app directory inside the container
WORKDIR /app

# Copy only server package files first for better layer caching
COPY package*.json ./
RUN npm install

# Copy server sources
COPY . .

# Expose port 5000
EXPOSE 5000

CMD ["npm", "run", "start"]
