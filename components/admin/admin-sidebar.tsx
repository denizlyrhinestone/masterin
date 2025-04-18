"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Users, BookOpen, Settings, LogOut, UserCheck, BarChart3, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-64 bg-muted/40 border-r h-screen flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <div className="flex-1 py-4 px-2">
        <nav className="space-y-1">
          <NavItem href="/admin" icon={<Home className="h-5 w-5" />} isActive={isActive("/admin")}>
            Dashboard
          </NavItem>

          <NavItem
            href="/admin/verification-requests"
            icon={<UserCheck className="h-5 w-5" />}
            isActive={isActive("/admin/verification-requests")}
          >
            Verification Requests
          </NavItem>

          <NavItem href="/admin/users" icon={<Users className="h-5 w-5" />} isActive={isActive("/admin/users")}>
            Users
          </NavItem>

          <NavItem href="/admin/courses" icon={<BookOpen className="h-5 w-5" />} isActive={isActive("/admin/courses")}>
            Courses
          </NavItem>

          <NavItem
            href="/admin/analytics"
            icon={<BarChart3 className="h-5 w-5" />}
            isActive={isActive("/admin/analytics")}
          >
            Analytics
          </NavItem>

          <NavItem
            href="/admin/settings"
            icon={<Settings className="h-5 w-5" />}
            isActive={isActive("/admin/settings")}
          >
            Settings
          </NavItem>
        </nav>
      </div>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  isActive: boolean
  children: React.ReactNode
}

function NavItem({ href, icon, isActive, children }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}
