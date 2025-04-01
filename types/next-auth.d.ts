declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: {
      id: string
      name: string
      isAdmin: boolean
      permissions: { resource: string; actions: string[] }[]
    }
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: {
      id: string
      name: string
      isAdmin: boolean
      permissions: { resource: string; actions: string[] }[]
    }
  }
}

