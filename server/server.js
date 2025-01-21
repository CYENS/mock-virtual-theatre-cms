import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import sqlite3 from 'sqlite3';
import { typeDefs } from './schema.js';
import { createResolvers } from './resolvers.js';

const db = new sqlite3.Database('../virtual_theatre.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database connected.');
    }
});

const server = new ApolloServer({
    typeDefs,
    resolvers: createResolvers(db),
});

export async function startServer() {
    
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });
    console.log(`🚀 Server is running at ${url}`);
}

export async function stopServer() {
    server.stop()
}

await startServer();
