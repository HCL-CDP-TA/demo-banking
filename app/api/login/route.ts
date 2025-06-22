import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const user = await prisma.customer.findUnique({ where: { email } })

    if (!user) return NextResponse.json({ error: "errors.userNotFound" }, { status: 401 })

    return NextResponse.json(
      { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "errors.genericError", consoleError: error.message }, { status: 500 })
  }
}
