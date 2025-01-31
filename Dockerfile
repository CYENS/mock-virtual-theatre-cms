﻿# Use Node 18 (LTS) or Node 20 as a base
FROM node:18

# Create server directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
COPY schema_and_data.sql ./
COPY virtual_theatre.db ./
COPY createDatabase.js ./
RUN npm install
RUN npm run prepare

# Copy remaining files into container
COPY . .

# Expose port 4000 from inside the container
EXPOSE 4000

# Launch the server
CMD ["node", "server/server.js"]
