// src/lib/auth.ts
// NextAuth.js v5 Configuration for Mix & Munch

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Validation schemas
const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth2
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    
    // Email/Password credentials
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        const { email, password } = SignInSchema.parse(credentials)
        
        // Find user
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null
        
        if (!user.isActive) {
          throw new Error("Account is inactive")
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        }
      },
    }),
  ],
  
  pages: {
    signIn: "/login",
    signUp: "/signup",
    error: "/auth-error",
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user is active (for blocking/banning)
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        
        if (dbUser && !dbUser.isActive) {
          return false
        }
      }
      
      return true
    },
    
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role
        session.user.isActive = user.isActive
      }
      return session
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
  },
  
  events: {
    async signIn({ user, account }) {
      // Log signin to audit log
      await prisma.auditLog.create({
        data: {
          action: "signin",
          entity: "User",
          targetId: user.id!,
          userId: user.id!,
          details: JSON.stringify({
            provider: account?.provider,
          }),
        },
      })
    },
    
    async signOut({ token }) {
      // Log signout
      if (token?.sub) {
        await prisma.auditLog.create({
          data: {
            action: "signout",
            entity: "User",
            targetId: token.sub,
            userId: token.sub,
          },
        })
      }
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role: "USER" | "MODERATOR" | "ADMIN"
      isActive: boolean
    }
  }
  
  interface User {
    id: string
    role: "USER" | "MODERATOR" | "ADMIN"
    isActive: boolean
  }
}
