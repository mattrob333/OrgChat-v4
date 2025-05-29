"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, User, Settings, FileText, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[60px] h-screen bg-card border-r border-border flex flex-col items-center py-4">
      <div className="mb-6 p-2 rounded-full bg-primary/10">
        <Users className="h-6 w-6 text-primary" />
      </div>

      <nav className="flex flex-col items-center gap-4">
        <Link
          href="/"
          className={cn("p-2 rounded-md hover:bg-secondary transition-colors", pathname === "/" && "bg-secondary")}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="sr-only">Dashboard</span>
        </Link>

        <Link
          href="/profile"
          className={cn(
            "p-2 rounded-md hover:bg-secondary transition-colors",
            pathname === "/profile" && "bg-secondary",
          )}
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Link>

        <Link
          href="/documents"
          className={cn(
            "p-2 rounded-md hover:bg-secondary transition-colors",
            pathname === "/documents" && "bg-secondary",
          )}
        >
          <FileText className="h-5 w-5" />
          <span className="sr-only">Documents</span>
        </Link>

        <Link
          href="/calendar"
          className={cn(
            "p-2 rounded-md hover:bg-secondary transition-colors",
            pathname === "/calendar" && "bg-secondary",
          )}
        >
          <Calendar className="h-5 w-5" />
          <span className="sr-only">Calendar</span>
        </Link>

        <Link
          href="/settings"
          className={cn(
            "p-2 rounded-md hover:bg-secondary transition-colors",
            pathname === "/settings" && "bg-secondary",
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Link>
      </nav>

      <div className="mt-auto">
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
      </div>
    </div>
  )
}
