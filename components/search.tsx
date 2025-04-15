"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useDebounce } from "@/hooks/use-debounce"
import { searchContent } from "@/lib/search-service"
import { useAuth } from "@/components/auth-provider"

type SearchResult = {
  id: string
  title: string
  type: "course" | "category" | "resource" | "article"
  url: string
  description?: string
  imageUrl?: string
}

export function Search() {
  const router = useRouter()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const searchResults = await searchContent(debouncedQuery, user?.id)
        setResults(searchResults)
      } catch (error) {
        console.error("Error searching content:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery, user?.id])

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    router.push(result.url)
  }

  // Clear search
  const handleClear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            ref={inputRef}
            placeholder="Search courses, resources, and more..."
            value={query}
            onValueChange={setQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-md"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <CommandList>
          {isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Searching...</p>
            </div>
          ) : (
            <>
              <CommandEmpty>
                {query ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">No results found for &quot;{query}&quot;</p>
                    <p className="text-xs text-muted-foreground mt-1">Try searching with different keywords</p>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">Start typing to search</p>
                  </div>
                )}
              </CommandEmpty>
              {results.length > 0 && (
                <>
                  {results.some((r) => r.type === "course") && (
                    <CommandGroup heading="Courses">
                      {results
                        .filter((r) => r.type === "course")
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            onSelect={() => handleSelect(result)}
                            className="flex items-center gap-2 py-2"
                          >
                            {result.imageUrl && (
                              <div className="h-8 w-8 rounded-md overflow-hidden bg-muted">
                                <img
                                  src={result.imageUrl || "/placeholder.svg"}
                                  alt={result.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span>{result.title}</span>
                              {result.description && (
                                <span className="text-xs text-muted-foreground line-clamp-1">{result.description}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}

                  {results.some((r) => r.type === "category") && (
                    <CommandGroup heading="Categories">
                      {results
                        .filter((r) => r.type === "category")
                        .map((result) => (
                          <CommandItem key={result.id} onSelect={() => handleSelect(result)}>
                            {result.title}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}

                  {results.some((r) => r.type === "resource" || r.type === "article") && (
                    <CommandGroup heading="Resources & Articles">
                      {results
                        .filter((r) => r.type === "resource" || r.type === "article")
                        .map((result) => (
                          <CommandItem key={result.id} onSelect={() => handleSelect(result)}>
                            {result.title}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
