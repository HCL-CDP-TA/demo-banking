// app/actions/customerActions.ts
"use server"

import Database from "better-sqlite3"
import path from "path"

const dbPath = path.resolve(process.cwd(), "data/customer.db")
const db = new Database(dbPath)

// Initialize the database and create the table if it doesn't exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS customer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password TEXT NOT NULL
  )
`,
).run()

export interface StoredCustomer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export async function getCustomerByEmail(email: string): Promise<StoredCustomer | null> {
  try {
    const stmt = db.prepare("SELECT * FROM customer WHERE email = ?")
    const customer = stmt.get(email) as StoredCustomer | undefined
    return customer || null
  } catch (error) {
    console.error("Error getting customer by email:", error)
    return null
  }
}

export async function saveCustomer(customerData: StoredCustomer): Promise<number> {
  try {
    // In a production environment, hash the password before saving
    const stmt = db.prepare("INSERT INTO customer (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)")
    const info = stmt.run(
      customerData.firstName,
      customerData.lastName,
      customerData.email,
      customerData.phone,
      customerData.password,
    )
    return Number(info.lastInsertRowid)
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      throw new Error("Email already registered.")
    }
    console.error("Error saving customer:", error)
    throw new Error("Failed to register customer.")
  }
}
