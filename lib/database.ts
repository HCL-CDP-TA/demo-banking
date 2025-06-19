import sqlite3 from "better-sqlite3"
import path from "path"

// Path to the database file
const dbPath = path.resolve(process.cwd(), "data/customers.db")

// Initialize the database connection
const db = sqlite3(dbPath)

export default db
