import { Pool } from "pg"

// Initialize the PostgreSQL connection pool using the DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Export the pool for querying the database
export default pool
