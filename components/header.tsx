import Link from "next/link"
import { Logo } from "@/components/logo"

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold">Masterin</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/ai" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              AI Tools
            </Link>
            <Link
              href="/courses"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Courses
            </Link>
            <Link
              href="/resources"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Resources
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
