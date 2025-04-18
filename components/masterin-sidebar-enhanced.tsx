"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, LayoutDashboard, Layers, Brain, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function MasterinSidebarEnhanced() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-primary">Masterin</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link href="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/categories")}>
              <Link href="/categories">
                <Layers className="h-5 w-5" />
                <span>Categories</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/my-courses")}>
              <Link href="/my-courses">
                <BookOpen className="h-5 w-5" />
                <span>My Courses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/ai-tutor")}>
              <Link href="/ai-tutor">
                <Brain className="h-5 w-5" />
                <span>AI Tutor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/sign-up">
            <User className="mr-2 h-5 w-5" />
            Sign Up
          </Link>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
