"use client"

import { Search, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"

export function AppHeader() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  // Function to get the current page title
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard"
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/categories") return "Categories"
    if (pathname.startsWith("/categories/")) return "Category Details"
    if (pathname === "/my-courses") return "My Courses"
    if (pathname.startsWith("/courses/")) return "Course Details"
    if (pathname === "/ai-tutor") return "AI Tutor"
    if (pathname === "/settings") return "Settings"
    if (pathname === "/community") return "Community"
    return "Masterin"
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U"
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      <div className="relative hidden md:flex">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search..." className="w-64 rounded-full bg-muted pl-8 md:w-80 lg:w-96" />
      </div>
      <div className="flex items-center gap-4">
        <NotificationsDropdown />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {profile?.full_name || user.email}
                <p className="text-xs font-normal text-muted-foreground capitalize">{profile?.role || "Student"}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="default" size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
