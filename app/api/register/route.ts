import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, phone } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const existing = await prisma.customer.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "errors.userExists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.customer.create({
      data: { email, password: hashedPassword, firstName, lastName, phone },
    })

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Register API error:", error)
      return NextResponse.json({ error: "errors.genericError", consoleError: error.message }, { status: 500 })
    }
    console.error("Register API unknown error:", error)
    return NextResponse.json({ error: "errors.genericError" }, { status: 500 })
  }
}
