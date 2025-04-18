"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Book,
  BookOpen,
  Brain,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  ListChecks,
  type LucideIcon,
  MessageSquare,
  PlusCircle,
  Settings,
  Trophy,
  Upload,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchForm } from "./search-form"

// Types for user roles
type UserRole = "student" | "educator" | "admin"

interface UserData {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface SidebarNavItemProps {
  href: string
  icon: LucideIcon
  title: string
  badge?: string
  isActive?: boolean
}

// Mock user data - in a real app this would come from auth context
const currentUser: UserData = {
  id: "user-123",
  name: "Alex Johnson",
  email: "alex@example.com",
  role: "student", // Change to "educator" or "admin" to see different navigation
  avatar: "/vibrant-street-market.png",
}

function SidebarNavItem({ href, icon: Icon, title, badge, isActive }: SidebarNavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={title}>
        <Link href={href}>
          <Icon className="h-5 w-5" />
          <span>{title}</span>
          {badge && (
            <Badge className="ml-auto bg-primary/10 text-primary" variant="secondary">
              {badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function MasterinSidebar() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            Masterin<span className="text-primary">.org</span>
          </span>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SearchForm />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarNavItem
              href="/dashboard"
              icon={LayoutDashboard}
              title="Dashboard"
              isActive={isActive("/dashboard")}
            />

            {currentUser.role === "student" && (
              <>
                <SidebarNavItem
                  href="/my-courses"
                  icon={BookOpen}
                  title="My Courses"
                  badge="3"
                  isActive={isActive("/my-courses")}
                />
                <SidebarNavItem href="/explore" icon={Book} title="Explore Courses" isActive={isActive("/explore")} />
                <SidebarNavItem
                  href="/progress"
                  icon={LineChart}
                  title="My Progress"
                  isActive={isActive("/progress")}
                />
                <SidebarNavItem
                  href="/achievements"
                  icon={Trophy}
                  title="Achievements"
                  badge="New"
                  isActive={isActive("/achievements")}
                />
              </>
            )}

            {currentUser.role === "educator" && (
              <>
                <SidebarNavItem
                  href="/my-courses"
                  icon={BookOpen}
                  title="My Courses"
                  isActive={isActive("/my-courses")}
                />
                <SidebarNavItem href="/students" icon={Users} title="My Students" isActive={isActive("/students")} />
                <SidebarNavItem
                  href="/create-course"
                  icon={PlusCircle}
                  title="Create Course"
                  isActive={isActive("/create-course")}
                />
                <SidebarNavItem
                  href="/content-library"
                  icon={Upload}
                  title="Content Library"
                  isActive={isActive("/content-library")}
                />
                <SidebarNavItem
                  href="/analytics"
                  icon={LineChart}
                  title="Analytics"
                  isActive={isActive("/analytics")}
                />
              </>
            )}

            {currentUser.role === "admin" && (
              <>
                <SidebarNavItem href="/users" icon={Users} title="User Management" isActive={isActive("/users")} />
                <SidebarNavItem href="/courses" icon={Book} title="All Courses" isActive={isActive("/courses")} />
                <SidebarNavItem
                  href="/approvals"
                  icon={ListChecks}
                  title="Approvals"
                  badge="5"
                  isActive={isActive("/approvals")}
                />
                <SidebarNavItem href="/reports" icon={LineChart} title="Reports" isActive={isActive("/reports")} />
                <SidebarNavItem
                  href="/settings"
                  icon={Settings}
                  title="Site Settings"
                  isActive={isActive("/settings")}
                />
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNavItem href="/ai-tutor" icon={Brain} title="AI Tutor" isActive={isActive("/ai-tutor")} />
              <SidebarNavItem
                href="/community"
                icon={MessageSquare}
                title="Community"
                isActive={isActive("/community")}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2" size="sm">
              <Avatar className="mr-2 h-6 w-6">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{currentUser.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/settings">Settings</Link>
            </DropdownMenuItem>
            {currentUser.role === "student" && (
              <DropdownMenuItem asChild>
                <Link href="/subscriptions">Subscription</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
