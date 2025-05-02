"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, X } from "lucide-react"
import type { CourseSearchParams } from "@/types/course"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"

interface CourseFiltersProps {
  searchParams: CourseSearchParams
  onUpdateSearchParams: (params: Partial<CourseSearchParams>) => void
  totalCourses: number
}

export function CourseFilters({ searchParams, onUpdateSearchParams, totalCourses }: CourseFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const [isMobile, setIsMobile] = useState(false)

  // Categories and levels for filters
  const categories = [
    "Computer Science",
    "Data Science",
    "Business",
    "Mathematics",
    "Language",
    "Science",
    "Arts & Design",
    "Personal Development",
  ]

  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"]

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ]

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  // Update search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchParams.search) {
      onUpdateSearchParams({ search: debouncedSearchQuery })
    }
  }, [debouncedSearchQuery, onUpdateSearchParams, searchParams.search])

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateSearchParams({ search: searchQuery })
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    onUpdateSearchParams({ category: value })
  }

  // Handle level change
  const handleLevelChange = (value: string) => {
    onUpdateSearchParams({ level: value })
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    onUpdateSearchParams({ sort: value as CourseSearchParams["sort"] })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    onUpdateSearchParams({
      search: "",
      category: "",
      level: "",
      sort: "newest",
      page: 1,
    })
  }

  // Check if any filters are active
  const hasActiveFilters =
    searchParams.search || searchParams.category || searchParams.level || searchParams.sort !== "newest"

  // Desktop filters
  const DesktopFilters = () => (
    <div className="hidden md:flex flex-col space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={searchParams.category || ""} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Level</label>
          <Select value={searchParams.level || ""} onValueChange={handleLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Sort By</label>
          <Select value={searchParams.sort || "newest"} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  // Mobile filters
  const MobileFilters = () => (
    <div className="md:hidden w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 bg-primary h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {(searchParams.category ? 1 : 0) +
                  (searchParams.level ? 1 : 0) +
                  (searchParams.sort !== "newest" ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={searchParams.category || ""} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Level</label>
              <Select value={searchParams.level || ""} onValueChange={handleLevelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Sort By</label>
              <Select value={searchParams.sort || "newest"} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="flex-row justify-between">
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
            <SheetClose asChild>
              <Button>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Input
          type="search"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pr-10"
        />
        <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-10 w-10">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{totalCourses}</span> courses
        </p>

        {/* Mobile sort dropdown */}
        <div className="md:hidden">
          <Select value={searchParams.sort || "newest"} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile filters */}
      <MobileFilters />

      {/* Desktop filters */}
      <DesktopFilters />
    </div>
  )
}
