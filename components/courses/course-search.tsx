"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface CourseSearchProps {
  defaultValue?: string
}

export default function CourseSearch({ defaultValue = "" }: CourseSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(window.location.search)

    if (searchQuery) {
      params.set("query", searchQuery)
    } else {
      params.delete("query")
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder="Search courses..."
          className="pl-10 pr-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="absolute right-0 top-0 h-full px-3"
          disabled={isPending}
        >
          {isPending ? "Searching..." : "Search"}
        </Button>
      </div>
    </form>
  )
}
