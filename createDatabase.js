import * as fs from "node:fs"; 
import sqlite3 from "sqlite3"

// Open or create the database
const db = new sqlite3.Database("./virtual_theatre.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Database connected.");
    }
});

// Read the .sql file
const sqlFilePath = "./schema_and_data.sql";
const sql = fs.readFileSync(sqlFilePath, "utf8");

// Execute the SQL commands
db.exec(sql, (err) => {
    if (err) {
        console.error("Error executing SQL script:", err.message);
    } else {
        console.log("Database schema and mock data created successfully.");
    }

    // Close the database
    db.close((err) => {
        if (err) {
            console.error("Error closing database:", err.message);
        } else {
            console.log("Database connection closed.");
        }
    });
});
