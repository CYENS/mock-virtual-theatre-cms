# Mock CMS For Virtual Theatre

## Quick Start

```bash
# Build and run containers
docker compose up --build

# If you only need to start already-built containers
docker compose up
```

- **GraphQL server** on [http://localhost:4000](http://localhost:4000)  
- **SQLite Web** on [http://localhost:8080](http://localhost:8080)

## Files

- **`docker-compose.yml`**: Runs the Node.js app + SQLite web viewer  
- **`Dockerfile`**: Builds the Node.js app container  
- **`server.js`** / **`schema.js`** / **`resolvers.js`**: Basic GraphQL setup  
- **`virtual_theatre.db`**: SQLite DB (mounted locally)  
