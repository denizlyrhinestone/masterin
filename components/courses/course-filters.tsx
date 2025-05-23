"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { Subject, GradeLevel } from "@/types"

interface CourseFiltersProps {
  subjects: Subject[]
  gradeLevels: GradeLevel[]
  selectedSubject?: string
  selectedGradeLevel?: string
  selectedSort?: "newest" | "popular" | "rating"
}

export default function CourseFilters({
  subjects,
  gradeLevels,
  selectedSubject,
  selectedGradeLevel,
  selectedSort = "newest",
}: CourseFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [subjectFilter, setSubjectFilter] = useState(selectedSubject || "all")
  const [gradeLevelFilter, setGradeLevelFilter] = useState(selectedGradeLevel || "all")
  const [sortOption, setSortOption] = useState(selectedSort)

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (subjectFilter !== "all") {
      params.set("subject", subjectFilter)
    }

    if (gradeLevelFilter !== "all") {
      params.set("gradeLevel", gradeLevelFilter)
    }

    if (sortOption) {
      params.set("sort", sortOption)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const resetFilters = () => {
    setSubjectFilter("all")
    setGradeLevelFilter("all")
    setSortOption("newest")
    router.push(pathname)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        <Accordion type="single" collapsible defaultValue="subject">
          <AccordionItem value="subject">
            <AccordionTrigger>Subject</AccordionTrigger>
            <AccordionContent>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gradeLevel">
            <AccordionTrigger>Grade Level</AccordionTrigger>
            <AccordionContent>
              <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grade Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grade Levels</SelectItem>
                  {gradeLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sort">
            <AccordionTrigger>Sort By</AccordionTrigger>
            <AccordionContent>
              <RadioGroup value={sortOption} onValueChange={(value: any) => setSortOption(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="newest" id="newest" />
                  <Label htmlFor="newest">Newest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="popular" id="popular" />
                  <Label htmlFor="popular">Most Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rating" id="rating" />
                  <Label htmlFor="rating">Highest Rated</Label>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex flex-col space-y-2">
        <Button onClick={applyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
