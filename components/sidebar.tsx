"use client"

import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePermission } from "@/hooks/use-permission"
import { LayoutDashboard, ClipboardList, Users, LogOut, Menu, X, Settings, Shield, Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isAdmin, hasPermission } = usePermission()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])


  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: ClipboardList,
      show: true,
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: Users,
      show: isAdmin || hasPermission("users", "read"),
    },
    {
      title: "Roles",
      href: "/dashboard/roles",
      icon: Shield,
      show: isAdmin,
    },
    {
      title: "Activity Logs",
      href: "/dashboard/activity",
      icon: Activity,
      show: isAdmin,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      show: true,
    },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <h2 className="text-lg font-semibold">IT Project Management</h2>
            <ThemeToggle />
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems
                .filter((item) => item.show)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.title}
                    </div>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t p-4">
            <div className="mb-2 flex items-center">
              <div className="ml-2">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                <p className="text-xs font-medium text-primary">{session?.user?.role?.name}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

