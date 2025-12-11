FROM node:20-bullseye

WORKDIR /app

# Install production dependencies first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]

