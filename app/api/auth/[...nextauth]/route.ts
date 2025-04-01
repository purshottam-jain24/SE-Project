import NextAuth, { NextAuthOptions } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const handler = (req: any, res: any) => NextAuth(req, res, authOptions)

export { handler as GET, handler as POST }

