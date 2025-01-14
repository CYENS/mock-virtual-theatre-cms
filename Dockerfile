# Use Node 18 (LTS) or Node 20 as a base
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
COPY createDatabase.js ./
COPY schema_and_data.sql ./
RUN npm install

# Copy remaining files into container
COPY . .

# Expose port 4000 from inside the container
EXPOSE 4000

# Launch the server
CMD ["node", "index.js"]
