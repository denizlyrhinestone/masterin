"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import type { AdminNavItem } from "./admin-layout"

interface AdminNavItemProps {
  item: AdminNavItem
  isExpanded: boolean
  onToggle: (title: string) => void
}

// Create a separate component for nav items to prevent unnecessary re-renders
const AdminNavItemComponent = ({ item, isExpanded, onToggle }: AdminNavItemProps) => {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href
  }

  const isSubmenuActive = (submenu?: AdminNavItem[]) => {
    if (!submenu) return false
    return submenu.some((item) => isActive(item.href))
  }

  return (
    <li>
      {item.submenu ? (
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isSubmenuActive(item.submenu) ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            onClick={() => onToggle(item.title)}
            aria-expanded={isExpanded}
            aria-controls={`submenu-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </div>
          </Button>
          {isExpanded && (
            <ul className="ml-6 space-y-1" id={`submenu-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
              {item.submenu.map((subItem) => (
                <li key={subItem.title}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActive(subItem.href) ? "bg-gray-100 dark:bg-gray-800" : ""}`}
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
  )
}
