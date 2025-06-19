import db from "./database"

interface CustomerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  registrationTime?: string
}

// Save a new customer to the database
export const saveCustomer = (customerData: CustomerData): number => {
  const stmt = db.prepare(`
    INSERT INTO customers (firstName, lastName, email, phone, password, registrationTime)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    customerData.firstName,
    customerData.lastName,
    customerData.email,
    customerData.phone,
    customerData.password, // In production, hash passwords before saving
    new Date().toISOString(),
  )
  return Number(result.lastInsertRowid) // Convert bigint to number and return the generated user ID
}

// Fetch a customer by email
export const getCustomerByEmail = (email: string): CustomerData | undefined => {
  const stmt = db.prepare(`
    SELECT * FROM customers WHERE email = ?
  `)
  return stmt.get(email) as CustomerData | undefined
}
