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
import { ServiceStatusIndicator } from "@/components/service-status-indicator"
import { ServiceType } from "@/lib/service-health"

// Define which features are implemented
const IMPLEMENTED_FEATURES = {
  AI_TUTOR: true,
  AI_STUDY_ASSISTANT: false,
  AI_WRITING_HELPER: false,
  AI_PROBLEM_SOLVER: false,
  COURSES: false,
  EDUCATORS: false,
  COMMUNITY: false,
  ABOUT: false,
}

const courseCategories = [
  {
    title: "Mathematics",
    href: IMPLEMENTED_FEATURES.COURSES ? "/courses/mathematics" : "/coming-soon",
    description: "Algebra, Calculus, Geometry, and more",
  },
  {
    title: "Science",
    href: IMPLEMENTED_FEATURES.COURSES ? "/courses/science" : "/coming-soon",
    description: "Physics, Chemistry, Biology, and Earth Sciences",
  },
  {
    title: "Language Arts",
    href: IMPLEMENTED_FEATURES.COURSES ? "/courses/language-arts" : "/coming-soon",
    description: "Reading, Writing, Literature, and Communication",
  },
  {
    title: "Social Studies",
    href: IMPLEMENTED_FEATURES.COURSES ? "/courses/social-studies" : "/coming-soon",
    description: "History, Geography, Economics, and Civics",
  },
  {
    title: "Computer Science",
    href: IMPLEMENTED_FEATURES.COURSES ? "/courses/computer-science" : "/coming-soon",
    description: "Programming, Web Development, and Data Science",
  },
  {
    title: "Arts & Music",
    href: IMPLEMENTED_FEATURES.COURSES ? "/courses/arts-music" : "/coming-soon",
    description: "Visual Arts, Music Theory, and Creative Expression",
  },
]

const aiFeatures = [
  {
    title: "AI Tutor",
    href: IMPLEMENTED_FEATURES.AI_TUTOR ? "/ai-tutor" : "/coming-soon",
    description: "Get personalized help with homework and learning concepts",
    implemented: IMPLEMENTED_FEATURES.AI_TUTOR,
    serviceType: ServiceType.OPENAI,
  },
  {
    title: "Study Assistant",
    href: IMPLEMENTED_FEATURES.AI_STUDY_ASSISTANT ? "/ai-study-assistant" : "/coming-soon",
    description: "Create study plans, flashcards, and practice quizzes",
    implemented: IMPLEMENTED_FEATURES.AI_STUDY_ASSISTANT,
    serviceType: ServiceType.OPENAI,
  },
  {
    title: "Writing Helper",
    href: IMPLEMENTED_FEATURES.AI_WRITING_HELPER ? "/ai-writing-helper" : "/coming-soon",
    description: "Improve your essays with feedback and suggestions",
    implemented: IMPLEMENTED_FEATURES.AI_WRITING_HELPER,
    serviceType: ServiceType.OPENAI,
  },
  {
    title: "Problem Solver",
    href: IMPLEMENTED_FEATURES.AI_PROBLEM_SOLVER ? "/ai-problem-solver" : "/coming-soon",
    description: "Step-by-step solutions for math and science problems",
    implemented: IMPLEMENTED_FEATURES.AI_PROBLEM_SOLVER,
    serviceType: ServiceType.OPENAI,
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
                <NavigationMenuTrigger className="transition-colors duration-200">Courses</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {courseCategories.map((category) => (
                      <li key={category.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={category.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors duration-200 hover:bg-slate-100 focus:bg-slate-100"
                          >
                            <div className="text-sm font-medium leading-none">{category.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-500">{category.description}</p>
                            {!IMPLEMENTED_FEATURES.COURSES && (
                              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                Coming Soon
                              </span>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:top-0 after:right-0 after:-mt-1 after:-mr-1 after:w-2 after:h-2 after:bg-emerald-500 after:rounded-full after:animate-pulse transition-colors duration-200">
                  AI Learning
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {aiFeatures.map((feature) => (
                      <li key={feature.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={feature.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors duration-200 hover:bg-slate-100 focus:bg-slate-100"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium leading-none">{feature.title}</div>
                              {feature.implemented && <ServiceStatusIndicator serviceType={feature.serviceType} />}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-500">{feature.description}</p>
                            {!feature.implemented && (
                              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                Coming Soon
                              </span>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href={IMPLEMENTED_FEATURES.EDUCATORS ? "/educators" : "/coming-soon"} legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "transition-colors duration-200")}>
                    Educators
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href={IMPLEMENTED_FEATURES.COMMUNITY ? "/community" : "/coming-soon"} legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "transition-colors duration-200")}>
                    Community
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href={IMPLEMENTED_FEATURES.ABOUT ? "/about" : "/coming-soon"} legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "transition-colors duration-200")}>
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="transition-colors duration-200 hover:bg-gray-100">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" asChild className="transition-colors duration-200 hover:bg-gray-100">
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 hover:shadow-md"
            >
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="transition-colors duration-200 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href={IMPLEMENTED_FEATURES.COURSES ? "/courses" : "/coming-soon"}
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200",
                pathname.startsWith("/courses")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              Courses
              {!IMPLEMENTED_FEATURES.COURSES && (
                <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href={IMPLEMENTED_FEATURES.AI_TUTOR ? "/ai-tutor" : "/coming-soon"}
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium text-emerald-600 relative transition-colors duration-200",
                pathname.startsWith("/ai")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-emerald-600 hover:bg-gray-50 hover:text-emerald-700",
              )}
            >
              AI Learning
              <span className="absolute top-0 right-0 -mt-1 -mr-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </Link>
            <Link
              href={IMPLEMENTED_FEATURES.EDUCATORS ? "/educators" : "/coming-soon"}
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200",
                pathname.startsWith("/educators")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              Educators
              {!IMPLEMENTED_FEATURES.EDUCATORS && (
                <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href={IMPLEMENTED_FEATURES.COMMUNITY ? "/community" : "/coming-soon"}
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200",
                pathname.startsWith("/community")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              Community
              {!IMPLEMENTED_FEATURES.COMMUNITY && (
                <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href={IMPLEMENTED_FEATURES.ABOUT ? "/about" : "/coming-soon"}
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200",
                pathname.startsWith("/about")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              About
              {!IMPLEMENTED_FEATURES.ABOUT && (
                <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Coming Soon
                </span>
              )}
            </Link>
            <div className="mt-4 flex flex-col space-y-2">
              <Button variant="outline" asChild className="w-full justify-center transition-colors duration-200">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
              >
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
