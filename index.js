import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import sqlite3 from 'sqlite3';
import { typeDefs } from './schema.js';
import { createResolvers } from './resolvers.js';

// Open or create the database
const db = new sqlite3.Database('./virtual_theatre.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database connected.');
    }
});

// Create Apollo Server
const server = new ApolloServer({
    typeDefs,
    // We create resolvers by passing `db` so each resolver can query the DB
    resolvers: createResolvers(db),
});

// Start the server
async function startServer() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });
    console.log(`🚀 Server is running at ${url}`);
}

startServer().catch((err) => {
    console.error('Error starting server:', err);
});
