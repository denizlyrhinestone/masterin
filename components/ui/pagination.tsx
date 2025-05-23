"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?"
    return `${baseUrl}${separator}page=${page}`
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button variant="outline" size="icon" disabled={!prevPage} asChild={!!prevPage}>
        {prevPage ? (
          <Link href={getPageUrl(prevPage)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <Button variant="outline" size="icon" disabled={!nextPage} asChild={!!nextPage}>
        {nextPage ? (
          <Link href={getPageUrl(nextPage)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  )
}
