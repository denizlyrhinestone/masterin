"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Shield,
  ImageIcon,
  Video,
  ClipboardList,
  Database,
  Server,
  ChevronRight,
} from "lucide-react"

interface AdminNavItem {
  title: string
  href: string
  icon: React.ReactNode
  submenu?: AdminNavItem[]
}

const adminNavItems: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: <ClipboardList className="h-5 w-5" />,
    submenu: [
      {
        title: "Courses",
        href: "/admin/courses",
        icon: <Video className="h-5 w-5" />,
      },
      {
        title: "Media",
        href: "/admin/media",
        icon: <ImageIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "Thumbnails",
    href: "/admin/thumbnails",
    icon: <ImageIcon className="h-5 w-5" />,
  },
  {
    title: "Batch Processing",
    href: "/admin/batch-thumbnails",
    icon: <Video className="h-5 w-5" />,
  },
  {
    title: "Jobs Queue",
    href: "/admin/batch-jobs",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "System",
    href: "/admin/system",
    icon: <Server className="h-5 w-5" />,
    submenu: [
      {
        title: "Security",
        href: "/admin/security",
        icon: <Shield className="h-5 w-5" />,
      },
      {
        title: "Database",
        href: "/admin/database",
        icon: <Database className="h-5 w-5" />,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: <Settings className="h-5 w-5" />,
      },
      {
        title: "Groq Status",
        href: "/admin/groq-status",
        icon: <Server className="h-5 w-5" />,
      },
    ],
  },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleSubmenu = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const isSubmenuActive = (submenu?: AdminNavItem[]) => {
    if (!submenu) return false
    return submenu.some((item) => isActive(item.href))
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="px-3 py-2">
          <ul className="space-y-1">
            {adminNavItems.map((item) => (
              <li key={item.title}>
                {item.submenu ? (
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isSubmenuActive(item.submenu) ? "bg-gray-100 dark:bg-gray-800" : ""
                      }`}
                      onClick={() => toggleSubmenu(item.title)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.title}</span>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${expandedItems[item.title] ? "rotate-90" : ""}`}
                        />
                      </div>
                    </Button>
                    {expandedItems[item.title] && (
                      <ul className="ml-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.title}>
                            <Button
                              variant="ghost"
                              className={`w-full justify-start ${
                                isActive(subItem.href) ? "bg-gray-100 dark:bg-gray-800" : ""
                              }`}
                              asChild
                            >
                              <Link href={subItem.href}>
                                <div className="flex items-center">
                                  {subItem.icon}
                                  <span className="ml-3">{subItem.title}</span>
                                </div>
                              </Link>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActive(item.href) ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                    asChild
                  >
                    <Link href={item.href}>
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </div>
                    </Link>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
