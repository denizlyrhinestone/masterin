"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  Code,
  BarChart,
  Briefcase,
  Palette,
  GraduationCap,
  Languages,
  Camera,
  Music,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Category data with enhanced information
const courseCategories = [
  {
    id: "technology",
    name: "Technology",
    slug: "technology",
    image: "/placeholder.svg?height=160&width=320&text=Technology",
    icon: <Code className="h-5 w-5" />,
    color: "blue",
    count: 42,
    trending: true,
    description: "Master web development, mobile apps, programming languages, and more cutting-edge tech skills.",
    subcategories: [
      { name: "Web Development", count: 15 },
      { name: "Mobile Development", count: 8 },
      { name: "Programming Languages", count: 12 },
      { name: "DevOps & Cloud Computing", count: 7 },
    ],
  },
  {
    id: "business",
    name: "Business",
    slug: "business",
    image: "/placeholder.svg?height=160&width=320&text=Business",
    icon: <Briefcase className="h-5 w-5" />,
    color: "purple",
    count: 38,
    trending: true,
    description: "Develop essential business skills in marketing, entrepreneurship, finance, and management.",
    subcategories: [
      { name: "Marketing", count: 10 },
      { name: "Entrepreneurship", count: 8 },
      { name: "Finance", count: 12 },
      { name: "Management", count: 8 },
    ],
  },
  {
    id: "art-design",
    name: "Art & Design",
    slug: "art-design",
    image: "/placeholder.svg?height=160&width=320&text=Art+%26+Design",
    icon: <Palette className="h-5 w-5" />,
    color: "pink",
    count: 25,
    trending: false,
    description: "Express your creativity through graphic design, illustration, UI/UX design, and animation.",
    subcategories: [
      { name: "Graphic Design", count: 8 },
      { name: "UI/UX Design", count: 7 },
      { name: "Illustration", count: 5 },
      { name: "Animation", count: 5 },
    ],
  },
  {
    id: "data-science",
    name: "Data Science",
    slug: "data-science",
    image: "/placeholder.svg?height=160&width=320&text=Data+Science",
    icon: <BarChart className="h-5 w-5" />,
    color: "green",
    count: 31,
    trending: true,
    description: "Analyze data, build machine learning models, and extract insights with powerful data tools.",
    subcategories: [
      { name: "Machine Learning", count: 9 },
      { name: "Data Analysis", count: 8 },
      { name: "Big Data", count: 7 },
      { name: "Statistics", count: 7 },
    ],
  },
  {
    id: "languages",
    name: "Languages",
    slug: "languages",
    image: "/placeholder.svg?height=160&width=320&text=Languages",
    icon: <Languages className="h-5 w-5" />,
    color: "orange",
    count: 28,
    trending: false,
    description: "Learn to speak, write, and understand new languages with expert instructors and native speakers.",
    subcategories: [
      { name: "English", count: 10 },
      { name: "Spanish", count: 7 },
      { name: "Mandarin", count: 5 },
      { name: "French", count: 6 },
    ],
  },
  {
    id: "academics",
    name: "Academics",
    slug: "academics",
    image: "/placeholder.svg?height=160&width=320&text=Academics",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "indigo",
    count: 35,
    trending: false,
    description: "Explore academic subjects including mathematics, science, history, and literature.",
    subcategories: [
      { name: "Mathematics", count: 12 },
      { name: "Science", count: 10 },
      { name: "History", count: 7 },
      { name: "Literature", count: 6 },
    ],
  },
  {
    id: "photography",
    name: "Photography",
    slug: "photography",
    image: "/placeholder.svg?height=160&width=320&text=Photography",
    icon: <Camera className="h-5 w-5" />,
    color: "cyan",
    count: 19,
    trending: false,
    description: "Capture stunning images with courses on digital photography, editing, and specialized techniques.",
    subcategories: [
      { name: "Digital Photography", count: 7 },
      { name: "Photo Editing", count: 5 },
      { name: "Portrait Photography", count: 4 },
      { name: "Landscape Photography", count: 3 },
    ],
  },
  {
    id: "music",
    name: "Music",
    slug: "music",
    image: "/placeholder.svg?height=160&width=320&text=Music",
    icon: <Music className="h-5 w-5" />,
    color: "red",
    count: 22,
    trending: false,
    description: "Develop your musical talents with courses on instruments, music theory, production, and vocals.",
    subcategories: [
      { name: "Instruments", count: 8 },
      { name: "Music Theory", count: 5 },
      { name: "Music Production", count: 6 },
      { name: "Vocal Training", count: 3 },
    ],
  },
]

// Filter options
const filterOptions = [
  { id: "all", label: "All Categories" },
  { id: "trending", label: "Trending" },
  { id: "popular", label: "Most Popular" },
  { id: "newest", label: "Newest" },
]

interface CategoryExplorerProps {
  variant?: "compact" | "expanded" | "featured"
  maxCategories?: number
  showSearch?: boolean
  showFilters?: boolean
  showSubcategories?: boolean
  className?: string
}

export default function CategoryExplorer({
  variant = "expanded",
  maxCategories,
  showSearch = true,
  showFilters = true,
  showSubcategories = true,
  className,
}: CategoryExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [displayedCategories, setDisplayedCategories] = useState(courseCategories)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and window resize
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

  // Filter and search categories
  useEffect(() => {
    let filtered = [...courseCategories]

    // Apply active filter
    if (activeFilter === "trending") {
      filtered = filtered.filter((category) => category.trending)
    } else if (activeFilter === "popular") {
      filtered = filtered.sort((a, b) => b.count - a.count)
    } else if (activeFilter === "newest") {
      // In a real app, you would sort by date added
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          category.description.toLowerCase().includes(query) ||
          category.subcategories.some((sub) => sub.name.toLowerCase().includes(query)),
      )
    }

    // Apply max categories limit if specified
    if (maxCategories) {
      filtered = filtered.slice(0, maxCategories)
    }

    setDisplayedCategories(filtered)
  }, [searchQuery, activeFilter, maxCategories])

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Get color class based on category color
  const getColorClass = (color: string, element: "bg" | "text" | "border" | "hover") => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
        hover: "hover:bg-blue-200",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        border: "border-purple-200",
        hover: "hover:bg-purple-200",
      },
      pink: {
        bg: "bg-pink-100",
        text: "text-pink-600",
        border: "border-pink-200",
        hover: "hover:bg-pink-200",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        border: "border-green-200",
        hover: "hover:bg-green-200",
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        border: "border-orange-200",
        hover: "hover:bg-orange-200",
      },
      indigo: {
        bg: "bg-indigo-100",
        text: "text-indigo-600",
        border: "border-indigo-200",
        hover: "hover:bg-indigo-200",
      },
      cyan: {
        bg: "bg-cyan-100",
        text: "text-cyan-600",
        border: "border-cyan-200",
        hover: "hover:bg-cyan-200",
      },
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        border: "border-red-200",
        hover: "hover:bg-red-200",
      },
    }

    return colorMap[color]?.[element] || colorMap.blue[element]
  }

  // Render compact variant (simple grid with minimal info)
  const renderCompactVariant = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayedCategories.map((category) => (
        <Link key={category.id} href={`/courses/${category.slug}`}>
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative h-32 overflow-hidden rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
              <div className="flex items-center gap-1.5">
                <div className={cn("p-1.5 rounded-full", getColorClass(category.color, "bg"))}>
                  <div className={getColorClass(category.color, "text")}>{category.icon}</div>
                </div>
                <h3 className="font-medium text-white">{category.name}</h3>
              </div>
              <p className="text-xs text-white/80 mt-1">{category.count} courses</p>
            </div>
            {category.trending && (
              <Badge className="absolute top-2 right-2 z-20 bg-red-500 text-white border-red-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </motion.div>
        </Link>
      ))}
    </div>
  )

  // Render expanded variant (detailed cards with descriptions)
  const renderExpandedVariant = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedCategories.map((category) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
          className="group"
        >
          <Link href={`/courses/${category.slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-gray-300">
              <div className="relative h-48">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className={cn("p-2 rounded-full", getColorClass(category.color, "bg"))}>
                    <div className={getColorClass(category.color, "text")}>{category.icon}</div>
                  </div>
                  {category.trending && (
                    <Badge className="bg-red-500 text-white border-red-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  <div className="flex items-center text-white/80 text-sm mt-1">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{category.count} courses</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{category.description}</p>
                {showSubcategories && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {category.subcategories.slice(0, 3).map((subcategory, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={cn(
                          "bg-gray-50 border",
                          hoveredCategory === category.id && getColorClass(category.color, "border"),
                          hoveredCategory === category.id && getColorClass(category.color, "text"),
                        )}
                      >
                        {subcategory.name}
                      </Badge>
                    ))}
                    {category.subcategories.length > 3 && (
                      <Badge variant="outline" className="bg-gray-50">
                        +{category.subcategories.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "mt-4 flex items-center text-sm font-medium transition-colors",
                    getColorClass(category.color, "text"),
                  )}
                >
                  Explore Category
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )

  // Render featured variant (large featured card with smaller cards)
  const renderFeaturedVariant = () => {
    // Get trending categories first, then others
    const trendingCategories = displayedCategories.filter((cat) => cat.trending)
    const otherCategories = displayedCategories.filter((cat) => !cat.trending)
    const sortedCategories = [...trendingCategories, ...otherCategories]

    const featuredCategory = sortedCategories[0]
    const remainingCategories = sortedCategories.slice(1)

    return (
      <div className="space-y-6">
        {featuredCategory && (
          <Link href={`/courses/${featuredCategory.slug}`}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl"
            >
              <div className="relative aspect-[21/9] w-full">
                <Image
                  src={featuredCategory.image || "/placeholder.svg"}
                  alt={featuredCategory.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10 lg:max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("p-2 rounded-full", getColorClass(featuredCategory.color, "bg"))}>
                      <div className={getColorClass(featuredCategory.color, "text")}>{featuredCategory.icon}</div>
                    </div>
                    {featuredCategory.trending && (
                      <Badge className="bg-red-500 text-white border-red-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{featuredCategory.name}</h2>
                  <p className="text-white/90 mb-4 max-w-xl">{featuredCategory.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredCategory.subcategories.map((subcategory, index) => (
                      <Badge key={index} className={cn("bg-white/20 hover:bg-white/30 text-white border-white/10")}>
                        {subcategory.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-white/80 text-sm">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{featuredCategory.count} courses</span>
                    </div>
                    <Button className={cn("bg-white text-gray-800 hover:bg-gray-100")}>
                      Explore {featuredCategory.name}
                      <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {remainingCategories.map((category) => (
            <Link key={category.id} href={`/courses/${category.slug}`}>
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative h-32 overflow-hidden rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("p-1.5 rounded-full", getColorClass(category.color, "bg"))}>
                      <div className={getColorClass(category.color, "text")}>{category.icon}</div>
                    </div>
                    <h3 className="font-medium text-white">{category.name}</h3>
                  </div>
                  <p className="text-xs text-white/80 mt-1">{category.count} courses</p>
                </div>
                {category.trending && (
                  <Badge className="absolute top-2 right-2 z-20 bg-red-500 text-white border-red-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {showSearch && (
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-2 w-full"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {showFilters && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {filterOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={activeFilter === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(option.id)}
                  className={activeFilter === option.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {option.id === "trending" && <TrendingUp className="h-4 w-4 mr-1.5" />}
                  {option.id === "popular" && <Users className="h-4 w-4 mr-1.5" />}
                  {option.id === "newest" && <Clock className="h-4 w-4 mr-1.5" />}
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {displayedCategories.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setActiveFilter("all")
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Categories display based on variant */}
      <AnimatePresence mode="wait">
        {displayedCategories.length > 0 && (
          <motion.div
            key={variant + activeFilter + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {variant === "compact" && renderCompactVariant()}
            {variant === "expanded" && renderExpandedVariant()}
            {variant === "featured" && renderFeaturedVariant()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
