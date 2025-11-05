FROM node:24-alpine
WORKDIR /

COPY package*.json ./
RUN npm install

COPY . .

# Expose port 5000
EXPOSE 5000

CMD ["npm", "run", "start"]
