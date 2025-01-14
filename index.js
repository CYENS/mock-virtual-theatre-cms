
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import sqlite3 from "sqlite3";

// const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./virtual_theatre.db');

// GraphQL Schema
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    eos_id: String!
    avatars: [Avatar]
  }

  type Scene {
    id: ID!
    name: String!
    pcloud_file_id: Int!
  }

  type Performance {
    id: ID!
    title: String!
    owner: User!
    about: String
    scenes: [Scene]
    cast: [Avatar]
  }

  type Avatar {
    id: ID!
    name: String!
    user: User!
  }

  type Session {
    id: ID!
    title: String!
    performance: Performance!
    motion_data: String
    face_data: String
    light_data: String
    prop_data: String
    streaming_url: String
    attendees: [User]
  }

  type Query {
    users: [User]
    scenes: [Scene]
    performances: [Performance]
    sessions: [Session]
  }
`;

// Resolvers
const resolvers = {
    Query: {
        users: () => {
            return new Promise((resolve, reject) => {
                db.all('SELECT * FROM users', (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
        },
        scenes: () => {
            return new Promise((resolve, reject) => {
                db.all('SELECT * FROM scenes', (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
        },
        performances: () => {
            return new Promise((resolve, reject) => {
                db.all('SELECT * FROM performances', (err, rows) => {
                    if (err) reject(err);
                    resolve(
                        rows.map(performance => ({
                            ...performance,
                            owner: db.prepare('SELECT * FROM users WHERE id = ?').get(performance.owner),
                            scenes: db.prepare(
                                `SELECT s.* FROM scenes s 
                 JOIN scenes_performances sp ON s.id = sp.scene_id 
                 WHERE sp.performance_id = ?`
                            ).all(performance.id),
                            cast: db.prepare(
                                `SELECT a.* FROM avatars a 
                 JOIN performance_cast pc ON a.id = pc.avatar_id 
                 WHERE pc.performance_id = ?`
                            ).all(performance.id),
                        }))
                    );
                });
            });
        },
        sessions: () => {
            return new Promise((resolve, reject) => {
                db.all('SELECT * FROM sessions', (err, rows) => {
                    if (err) reject(err);
                    resolve(
                        rows.map(session => ({
                            ...session,
                            performance: db.prepare('SELECT * FROM performances WHERE id = ?').get(session.performance_id),
                            attendees: db.prepare(
                                `SELECT u.* FROM users u 
                 JOIN user_attendance ua ON u.id = ua.user_id 
                 WHERE ua.session_id = ?`
                            ).all(session.id),
                        }))
                    );
                });
            });
        },
    },
};

// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
// // Start the server
// server.listen().then(({ url }) => {
//     console.log(`🚀 Server ready at ${url}`);
// });
