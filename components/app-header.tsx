"use client"

import { Bell, Search } from "lucide-react"
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

export function AppHeader() {
  const pathname = usePathname()

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 md:gap-4 border-b bg-background px-3 md:px-6">
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg md:text-xl font-semibold truncate">{getPageTitle()}</h1>
        <Button variant="ghost" size="icon" className="md:hidden rounded-full">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
      <div className="relative hidden md:flex">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search..." className="w-64 rounded-full bg-muted pl-8 md:w-80 lg:w-96" />
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/vibrant-street-market.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/logout">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
