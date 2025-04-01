import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Project <span className="text-primary">Management</span> Portal
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A full-stack project management solution with role-based access control, built with Next.js, MongoDB, and
          NextAuth.js.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

