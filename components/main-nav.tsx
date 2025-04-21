"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"

const courseCategories = [
  {
    title: "Mathematics",
    href: "/courses/mathematics",
    description: "Algebra, Calculus, Geometry, and more",
  },
  {
    title: "Science",
    href: "/courses/science",
    description: "Physics, Chemistry, Biology, and Earth Sciences",
  },
  {
    title: "Language Arts",
    href: "/courses/language-arts",
    description: "Reading, Writing, Literature, and Communication",
  },
  {
    title: "Social Studies",
    href: "/courses/social-studies",
    description: "History, Geography, Economics, and Civics",
  },
  {
    title: "Computer Science",
    href: "/courses/computer-science",
    description: "Programming, Web Development, and Data Science",
  },
  {
    title: "Arts & Music",
    href: "/courses/arts-music",
    description: "Visual Arts, Music Theory, and Creative Expression",
  },
]

const aiFeatures = [
  {
    title: "AI Tutor",
    href: "/ai-tutor",
    description: "Get personalized help with homework and learning concepts",
  },
  {
    title: "Study Assistant",
    href: "/ai-study-assistant",
    description: "Create study plans, flashcards, and practice quizzes",
  },
  {
    title: "Writing Helper",
    href: "/ai-writing-helper",
    description: "Improve your essays with feedback and suggestions",
  },
  {
    title: "Problem Solver",
    href: "/ai-problem-solver",
    description: "Step-by-step solutions for math and science problems",
  },
]

export function MainNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-emerald-600">Masterin</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Courses</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {courseCategories.map((category) => (
                      <li key={category.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={category.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                          >
                            <div className="text-sm font-medium leading-none">{category.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-500">{category.description}</p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  AI Learning
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {aiFeatures.map((feature) => (
                      <li key={feature.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={feature.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                          >
                            <div className="text-sm font-medium leading-none">{feature.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-500">{feature.description}</p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/educators" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Educators</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/community" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Community</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>About</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/courses"
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium",
                pathname.startsWith("/courses")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              Courses
            </Link>
            <Link
              href="/ai-tutor"
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium text-emerald-600",
                pathname.startsWith("/ai")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-emerald-600 hover:bg-gray-50 hover:text-emerald-700",
              )}
            >
              AI Learning
            </Link>
            <Link
              href="/educators"
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium",
                pathname.startsWith("/educators")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              Educators
            </Link>
            <Link
              href="/community"
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium",
                pathname.startsWith("/community")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              Community
            </Link>
            <Link
              href="/about"
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium",
                pathname.startsWith("/about")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              About
            </Link>
            <div className="mt-4 flex flex-col space-y-2">
              <Button variant="outline" asChild className="w-full justify-center">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="w-full justify-center bg-emerald-600 hover:bg-emerald-700">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
