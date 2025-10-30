// PHASE 1 API EXAMPLES
// Copy these into your Next.js src/app/api/ directory

// ============================================================================
// SIGNUP ENDPOINT: src/app/api/auth/signup/route.ts
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"

const SignUpSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name too short"),
  password: z.string().min(8, "Password too short"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = SignUpSchema.parse(body)
    
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }
    
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword, isActive: true },
      select: { id: true, email: true, name: true },
    })
    
    await prisma.auditLog.create({
      data: {
        action: "signup",
        entity: "User",
        targetId: user.id,
        userId: user.id,
      },
    })
    
    return NextResponse.json({ message: "Account created", user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================================================
// GET RECIPES: src/app/api/recipes/route.ts (GET)
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const cuisine = searchParams.get("cuisine")
    const skip = (page - 1) * limit
    
    const where: any = { status: "PUBLISHED", isPublic: true }
    if (cuisine) where.cuisine = cuisine
    
    const recipes = await prisma.recipe.findMany({
      where,
      take: limit,
      skip,
      select: {
        id: true,
        title: true,
        description: true,
        cuisine: true,
        difficulty: true,
        prepTime: true,
        cookTime: true,
      },
      orderBy: { createdAt: "desc" },
    })
    
    const total = await prisma.recipe.count({ where })
    
    return NextResponse.json({
      data: recipes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Get recipes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================================================
// CREATE RECIPE: src/app/api/recipes/route.ts (POST)
// ============================================================================

import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const recipe = await prisma.recipe.create({
      data: {
        ...body,
        authorId: session.user.id,
        status: "DRAFT",
      },
    })
    
    return NextResponse.json({ message: "Recipe created", recipe }, { status: 201 })
  } catch (error) {
    console.error("Create recipe error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================================================
// PRISMA CLIENT: src/lib/prisma.ts
// ============================================================================

import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// ============================================================================
// MIDDLEWARE: src/middleware.ts
// Protect routes that require authentication
// ============================================================================

import { auth } from "./lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Protected routes
  const protectedRoutes = [
    "/dashboard",
    "/meal-planner",
    "/shopping-list",
    "/pantry",
    "/profile",
  ]
  
  const isProtected = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )
  
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  
  // Admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/meal-planner/:path*",
    "/shopping-list/:path*",
    "/pantry/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
}
