import { saveCustomer, getCustomerByEmail } from "./customerService"

// Test saving a customer
const testCustomer = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "123-456-7890",
  password: "password123",
}

const userId = saveCustomer(testCustomer)
console.log(`Customer saved with ID: ${userId}`)

// Test fetching a customer
const fetchedCustomer = getCustomerByEmail("john.doe@example.com")
console.log("Fetched Customer:", fetchedCustomer)