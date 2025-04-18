"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Clock, Filter, Search, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

// Sample course data
const courses = [
  {
    id: "course-1",
    title: "Introduction to Algebra",
    subtitle: "Master algebraic concepts and problem-solving techniques",
    description:
      "A comprehensive introduction to algebraic concepts and problem-solving techniques for middle and high school students.",
    category: "Mathematics",
    subcategory: "Algebra",
    level: "Beginner",
    price: 0,
    isFree: true,
    instructor: {
      name: "Dr. Robert Chen",
      title: "Mathematics Specialist",
      avatar: "/placeholder.svg?height=40&width=40&query=avatar",
    },
    rating: 4.8,
    reviewCount: 245,
    studentCount: 1245,
    duration: "8 weeks",
    thumbnail: "/abstract-algebra-concepts.png",
    featured: true,
    popular: true,
    tags: ["mathematics", "algebra", "equations"],
  },
  {
    id: "course-2",
    title: "Biology Fundamentals",
    subtitle: "Explore living organisms, their structures, functions, and ecosystems",
    description:
      "A comprehensive introduction to biological sciences, covering cell structure, genetics, evolution, and ecosystems.",
    category: "Science",
    subcategory: "Biology",
    level: "Beginner",
    price: 49.99,
    isFree: false,
    instructor: {
      name: "Dr. Jane Smith",
      title: "Professor of Biology",
      avatar: "/placeholder.svg?height=40&width=40&query=avatar",
    },
    rating: 4.7,
    reviewCount: 189,
    studentCount: 982,
    duration: "10 weeks",
    thumbnail: "/microscopic-life.png",
    featured: false,
    popular: true,
    tags: ["biology", "science", "cells"],
  },
  {
    id: "course-3",
    title: "World History: Ancient Civilizations",
    subtitle: "Discover world civilizations, important events, and cultural developments",
    description: "Journey through the development of human civilizations from ancient times to the modern era.",
    category: "History",
    subcategory: "World History",
    level: "Intermediate",
    price: 39.99,
    isFree: false,
    instructor: {
      name: "Prof. David Miller",
      title: "History Educator",
      avatar: "/placeholder.svg?height=40&width=40&query=avatar",
    },
    rating: 4.6,
    reviewCount: 156,
    studentCount: 876,
    duration: "12 weeks",
    thumbnail: "/ancient-civilizations-timeline.png",
    featured: true,
    popular: false,
    tags: ["history", "civilizations", "culture"],
  },
  {
    id: "course-4",
    title: "Introduction to Programming with Python",
    subtitle: "Learn programming fundamentals with Python",
    description:
      "A beginner-friendly introduction to programming concepts using Python, one of the most popular and versatile programming languages.",
    category: "Computer Science",
    subcategory: "Programming",
    level: "Beginner",
    price: 59.99,
    isFree: false,
    instructor: {
      name: "Sarah Johnson",
      title: "Software Engineer",
      avatar: "/placeholder.svg?height=40&width=40&query=avatar",
    },
    rating: 4.9,
    reviewCount: 312,
    studentCount: 1567,
    duration: "8 weeks",
    thumbnail: "/coding-workspace.png",
    featured: false,
    popular: true,
    tags: ["programming", "python", "computer science"],
  },
  {
    id: "course-5",
    title: "Creative Writing Workshop",
    subtitle: "Develop your creative writing skills and find your unique voice",
    description:
      "Explore various forms of creative writing, develop your unique voice, and learn techniques to craft compelling stories.",
    category: "Language & Literature",
    subcategory: "Creative Writing",
    level: "All Levels",
    price: 29.99,
    isFree: false,
    instructor: {
      name: "Emily Parker",
      title: "Author & Writing Coach",
      avatar: "/placeholder.svg?height=40&width=40&query=avatar",
    },
    rating: 4.7,
    reviewCount: 98,
    studentCount: 542,
    duration: "6 weeks",
    thumbnail: "/creative-writing-desk.png",
    featured: false,
    popular: false,
    tags: ["writing", "literature", "creativity"],
  },
  {
    id: "course-6",
    title: "Chemistry Fundamentals",
    subtitle: "Exploring the building blocks of matter",
    description: "An engaging introduction to chemistry concepts for middle and high school students.",
    category: "Science",
    subcategory: "Chemistry",
    level: "Beginner",
    price: 0,
    isFree: true,
    instructor: {
      name: "Prof. Michael Johnson",
      title: "Chemistry Educator",
      avatar: "/placeholder.svg?height=40&width=40&query=avatar",
    },
    rating: 4.5,
    reviewCount: 78,
    studentCount: 456,
    duration: "8 weeks",
    thumbnail: "/placeholder.svg?height=200&width=400&query=chemistry",
    featured: false,
    popular: false,
    tags: ["chemistry", "science", "atoms"],
  },
]

// Categories for filters
const categories = [
  { value: "Mathematics", label: "Mathematics" },
  { value: "Science", label: "Science" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Language & Literature", label: "Language & Literature" },
  { value: "History", label: "History" },
  { value: "Arts & Music", label: "Arts & Music" },
]

// Levels for filters
const levels = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "All Levels", label: "All Levels" },
]

export function CourseCatalog() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 100])
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  // Filter courses based on search query and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category)

    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level)

    const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1]

    const matchesFree = !showFreeOnly || course.isFree

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesFree
  })

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Toggle level selection
  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedLevels([])
    setPriceRange([0, 100])
    setShowFreeOnly(false)
    setSearchQuery("")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Explore Courses</h1>
        <p className="text-muted-foreground">
          Discover a wide range of subjects tailored for middle and high school students
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="highest-rated">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {(selectedCategories.length > 0 || selectedLevels.length > 0 || showFreeOnly) && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {selectedCategories.length + selectedLevels.length + (showFreeOnly ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filter Courses</DrawerTitle>
                <DrawerDescription>Narrow down courses based on your preferences</DrawerDescription>
              </DrawerHeader>
              <div className="px-4">
                <Accordion type="multiple" defaultValue={["categories", "levels", "price"]}>
                  <AccordionItem value="categories">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.value}`}
                              checked={selectedCategories.includes(category.value)}
                              onCheckedChange={() => toggleCategory(category.value)}
                            />
                            <label
                              htmlFor={`category-${category.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="levels">
                    <AccordionTrigger>Levels</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {levels.map((level) => (
                          <div key={level.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`level-${level.value}`}
                              checked={selectedLevels.includes(level.value)}
                              onCheckedChange={() => toggleLevel(level.value)}
                            />
                            <label
                              htmlFor={`level-${level.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {level.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="price">
                    <AccordionTrigger>Price</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="free-only"
                            checked={showFreeOnly}
                            onCheckedChange={(checked) => setShowFreeOnly(checked === true)}
                          />
                          <label
                            htmlFor="free-only"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Free courses only
                          </label>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Price Range</span>
                            <span className="text-sm font-medium">
                              ${priceRange[0]} - ${priceRange[1]}
                            </span>
                          </div>
                          <Slider
                            defaultValue={[0, 100]}
                            max={100}
                            step={5}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            disabled={showFreeOnly}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              <DrawerFooter>
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
                <DrawerClose asChild>
                  <Button>Apply Filters</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-6 w-full justify-start rounded-lg bg-muted p-1">
          <TabsTrigger value="all" className="rounded-md">
            All Courses
          </TabsTrigger>
          <TabsTrigger value="featured" className="rounded-md">
            Featured
          </TabsTrigger>
          <TabsTrigger value="popular" className="rounded-md">
            Popular
          </TabsTrigger>
          <TabsTrigger value="free" className="rounded-md">
            Free
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses
              .filter((c) => c.featured)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses
              .filter((c) => c.popular)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="free" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses
              .filter((c) => c.isFree)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CourseCard({ course }: { course: any }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="relative">
        <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="h-48 w-full object-cover" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge className="bg-primary text-white">{course.category}</Badge>
          {course.featured && <Badge className="bg-secondary text-white">Featured</Badge>}
        </div>
      </div>
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold">{course.title}</h3>
          <Badge variant="outline">{course.level}</Badge>
        </div>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{course.subtitle}</p>
        <div className="mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{course.studentCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Star className="mr-1 h-4 w-4 text-amber-500" />
            <span>{course.rating}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <BookOpen className="mr-2 h-4 w-4" />
          <span>By {course.instructor.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {course.isFree ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Free
              </Badge>
            ) : (
              <span className="font-bold">${course.price.toFixed(2)}</span>
            )}
          </div>
          <Button asChild>
            <Link href={`/courses/${course.id}`}>View Course</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
