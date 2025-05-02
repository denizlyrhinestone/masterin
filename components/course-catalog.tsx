"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react" // Add useMemo and useCallback
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Calculator,
  ChevronRight,
  Code,
  FlaskRoundIcon as Flask,
  GraduationCap,
  Languages,
  Lightbulb,
  Palette,
  Search,
  ScrollText,
  Users,
  History,
  Bot,
} from "lucide-react"
import { CourseRecommendations } from "./course-recommendations"

// Define course type
interface Course {
  id: string
  title: string
  description: string
  gradeLevel: string
  aiFeatures: string[]
  thumbnail: string
  category: string
  subcategory: string
  popular?: boolean
  new?: boolean
}

// Define category type
interface Category {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  subcategories: {
    id: string
    title: string
    courses: Course[]
  }[]
}

export default function CourseCatalog() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Optimize toggle function with useCallback
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }, [])

  // Memoize filtered courses to prevent recalculation on every render
  const filteredCourses = useMemo(() => {
    if (!searchQuery && activeCategory === "all") {
      return categories
        .flatMap((category) => category.subcategories.flatMap((subcategory) => subcategory.courses))
        .slice(0, 6) // Just show first 6 courses when no filter
    }

    let filtered = categories

    if (activeCategory !== "all") {
      filtered = filtered.filter((category) => category.id === activeCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return filtered.flatMap((category) =>
        category.subcategories.flatMap((subcategory) =>
          subcategory.courses.filter(
            (course) =>
              course.title.toLowerCase().includes(query) ||
              course.description.toLowerCase().includes(query) ||
              course.gradeLevel.toLowerCase().includes(query) ||
              course.aiFeatures.some((feature) => feature.toLowerCase().includes(query)),
          ),
        ),
      )
    }

    return filtered.flatMap((category) => category.subcategories.flatMap((subcategory) => subcategory.courses))
  }, [searchQuery, activeCategory])

  // Course categories data
  const categories: Category[] = [
    {
      id: "mathematics",
      title: "Mathematics",
      description:
        "Comprehensive math courses from basic arithmetic to advanced calculus, featuring AI-powered problem solving and personalized learning paths.",
      icon: <Calculator className="h-5 w-5" />,
      subcategories: [
        {
          id: "elementary-math",
          title: "Elementary Math",
          courses: [
            {
              id: "early-math",
              title: "Early Math Foundations",
              description:
                "Introduction to numbers, counting, and basic operations with interactive exercises and AI-guided learning.",
              gradeLevel: "K-2",
              aiFeatures: ["Adaptive learning path", "Interactive problem solving", "Real-time feedback"],
              thumbnail: "/elementary-math.png",
              category: "mathematics",
              subcategory: "elementary-math",
              popular: true,
            },
            {
              id: "math-fundamentals",
              title: "Math Fundamentals",
              description:
                "Master multiplication, division, fractions, and decimals through engaging activities and personalized practice.",
              gradeLevel: "3-5",
              aiFeatures: ["Skill gap analysis", "Custom practice sets", "Visual learning aids"],
              thumbnail: "/placeholder.svg?key=4345z",
              category: "mathematics",
              subcategory: "elementary-math",
            },
            {
              id: "geometry-basics",
              title: "Geometry Basics",
              description:
                "Explore shapes, measurements, and spatial reasoning with interactive 3D models and hands-on activities.",
              gradeLevel: "3-5",
              aiFeatures: ["3D shape visualization", "Measurement tools", "Spatial reasoning games"],
              thumbnail: "/geometry-basics.png",
              category: "mathematics",
              subcategory: "elementary-math",
            },
          ],
        },
        {
          id: "middle-school-math",
          title: "Middle School Math",
          courses: [
            {
              id: "pre-algebra",
              title: "Pre-Algebra",
              description:
                "Bridge from arithmetic to algebraic thinking with interactive lessons and step-by-step problem solving.",
              gradeLevel: "6-7",
              aiFeatures: ["Step-by-step solution guidance", "Misconception detection", "Personalized practice"],
              thumbnail: "/pre-algebra-concepts.png",
              category: "mathematics",
              subcategory: "middle-school-math",
            },
            {
              id: "intro-algebra",
              title: "Introduction to Algebra",
              description:
                "Learn equations, variables, and functions through real-world applications and interactive examples.",
              gradeLevel: "7-8",
              aiFeatures: [
                "Equation solver with explanations",
                "Real-world application generator",
                "Progress tracking",
              ],
              thumbnail: "/algebra-concepts.png",
              category: "mathematics",
              subcategory: "middle-school-math",
              new: true,
            },
            {
              id: "middle-geometry",
              title: "Middle School Geometry",
              description:
                "Explore advanced shapes, area, volume, and theorems with interactive visualizations and problem sets.",
              gradeLevel: "6-8",
              aiFeatures: ["3D geometry explorer", "Theorem visualization", "Custom challenge problems"],
              thumbnail: "/placeholder.svg?key=7567i",
              category: "mathematics",
              subcategory: "middle-school-math",
            },
          ],
        },
        {
          id: "high-school-math",
          title: "High School Math",
          courses: [
            {
              id: "algebra-1",
              title: "Algebra I",
              description:
                "Master core algebraic concepts and applications with comprehensive lessons and practice problems.",
              gradeLevel: "9",
              aiFeatures: ["Advanced equation solver", "Mistake pattern recognition", "Custom review sessions"],
              thumbnail: "/placeholder.svg?key=p5i2u",
              category: "mathematics",
              subcategory: "high-school-math",
              popular: true,
            },
            {
              id: "algebra-2",
              title: "Algebra II",
              description:
                "Explore advanced algebraic concepts and functions with interactive graphs and real-world applications.",
              gradeLevel: "10-11",
              aiFeatures: ["Function visualizer", "Step-by-step solutions", "Exam preparation tools"],
              thumbnail: "/placeholder.svg?key=n7b73",
              category: "mathematics",
              subcategory: "high-school-math",
            },
            {
              id: "calculus",
              title: "Calculus",
              description:
                "Learn limits, derivatives, and integrals with dynamic visualizations and comprehensive problem sets.",
              gradeLevel: "11-12",
              aiFeatures: [
                "Derivative and integral calculator with explanations",
                "Concept visualization",
                "Advanced problem generator",
              ],
              thumbnail: "/calculus-concepts.png",
              category: "mathematics",
              subcategory: "high-school-math",
            },
          ],
        },
      ],
    },
    {
      id: "science",
      title: "Science",
      description:
        "Engaging science courses covering biology, chemistry, physics, and earth sciences with virtual labs and AI-guided experiments.",
      icon: <Flask className="h-5 w-5" />,
      subcategories: [
        {
          id: "elementary-science",
          title: "Elementary Science",
          courses: [
            {
              id: "science-exploration",
              title: "Science Exploration",
              description:
                "Introduction to scientific inquiry through hands-on experiments and interactive simulations.",
              gradeLevel: "K-2",
              aiFeatures: ["Virtual science experiments", "Interactive nature guides", "Science storytelling"],
              thumbnail: "/elementary-science.png",
              category: "science",
              subcategory: "elementary-science",
            },
            {
              id: "earth-space",
              title: "Earth and Space Science",
              description:
                "Discover planet Earth, the solar system, and beyond with immersive visualizations and activities.",
              gradeLevel: "3-5",
              aiFeatures: ["3D planet explorer", "Space simulation", "Weather prediction activities"],
              thumbnail: "/earth-and-space.png",
              category: "science",
              subcategory: "elementary-science",
              popular: true,
            },
            {
              id: "life-science-basics",
              title: "Life Science Basics",
              description:
                "Learn about plants, animals, and ecosystems through virtual field trips and interactive models.",
              gradeLevel: "3-5",
              aiFeatures: ["Ecosystem simulator", "Plant growth lab", "Animal classification AI"],
              thumbnail: "/placeholder.svg?key=sgkl3",
              category: "science",
              subcategory: "elementary-science",
            },
          ],
        },
        {
          id: "middle-school-science",
          title: "Middle School Science",
          courses: [
            {
              id: "earth-science",
              title: "Earth Science",
              description: "Explore geology, weather, and climate through interactive simulations and data analysis.",
              gradeLevel: "6",
              aiFeatures: ["Geological formation simulator", "Weather pattern analyzer", "Climate model explorer"],
              thumbnail: "/placeholder.svg?key=i6yh6",
              category: "science",
              subcategory: "middle-school-science",
            },
            {
              id: "life-science",
              title: "Life Science",
              description: "Study cells, organisms, and human body systems with virtual microscopes and 3D models.",
              gradeLevel: "7",
              aiFeatures: ["Virtual cell explorer", "Body systems simulator", "Genetic trait predictor"],
              thumbnail: "/placeholder.svg?key=sqqaa",
              category: "science",
              subcategory: "middle-school-science",
              new: true,
            },
            {
              id: "physical-science",
              title: "Physical Science",
              description:
                "Discover chemistry and physics foundations through virtual labs and interactive experiments.",
              gradeLevel: "8",
              aiFeatures: [
                "Chemical reaction simulator",
                "Physics experiment lab",
                "Formula calculator with explanations",
              ],
              thumbnail: "/placeholder.svg?key=cjorb",
              category: "science",
              subcategory: "middle-school-science",
            },
          ],
        },
        {
          id: "high-school-science",
          title: "High School Science",
          courses: [
            {
              id: "biology",
              title: "Biology",
              description:
                "Comprehensive study of cells, genetics, evolution, and ecology with virtual labs and simulations.",
              gradeLevel: "9-10",
              aiFeatures: ["DNA analysis tools", "Evolution simulator", "Ecological system modeler"],
              thumbnail: "/placeholder.svg?key=hz5fp",
              category: "science",
              subcategory: "high-school-science",
            },
            {
              id: "chemistry",
              title: "Chemistry",
              description:
                "Explore atomic structure, chemical reactions, and stoichiometry with interactive molecular models.",
              gradeLevel: "10-11",
              aiFeatures: ["Molecular structure visualizer", "Chemical equation balancer", "Virtual titration lab"],
              thumbnail: "/placeholder.svg?key=czgrd",
              category: "science",
              subcategory: "high-school-science",
              popular: true,
            },
            {
              id: "physics",
              title: "Physics",
              description:
                "Study motion, energy, electricity, and magnetism through interactive simulations and problem-solving.",
              gradeLevel: "11-12",
              aiFeatures: ["Physics simulation lab", "Force and motion analyzer", "Circuit builder with diagnostics"],
              thumbnail: "/placeholder.svg?key=nq84h",
              category: "science",
              subcategory: "high-school-science",
            },
          ],
        },
      ],
    },
    {
      id: "ela",
      title: "English Language Arts",
      description:
        "Comprehensive ELA courses developing reading, writing, and communication skills with AI-powered writing assistance and personalized reading recommendations.",
      icon: <ScrollText className="h-5 w-5" />,
      subcategories: [
        {
          id: "elementary-ela",
          title: "Elementary ELA",
          courses: [
            {
              id: "early-reading",
              title: "Early Reading Skills",
              description:
                "Develop phonics, sight words, and reading comprehension through interactive stories and games.",
              gradeLevel: "K-2",
              aiFeatures: [
                "Adaptive reading level assessment",
                "Interactive phonics practice",
                "Personalized book recommendations",
              ],
              thumbnail: "/placeholder.svg?key=2w1ds",
              category: "ela",
              subcategory: "elementary-ela",
              popular: true,
            },
            {
              id: "writing-fundamentals",
              title: "Writing Fundamentals",
              description: "Learn sentence structure and basic composition with guided writing exercises and feedback.",
              gradeLevel: "K-2",
              aiFeatures: ["Sentence structure analyzer", "Story starter generator", "Interactive grammar practice"],
              thumbnail: "/writing-fundamentals.png",
              category: "ela",
              subcategory: "elementary-ela",
            },
            {
              id: "reading-comprehension",
              title: "Reading Comprehension",
              description:
                "Enhance literature analysis and critical reading skills through guided reading and discussions.",
              gradeLevel: "3-5",
              aiFeatures: [
                "Reading comprehension assessment",
                "Vocabulary builder",
                "Text-to-speech with highlighting",
              ],
              thumbnail: "/reading-comprehension.png",
              category: "ela",
              subcategory: "elementary-ela",
            },
          ],
        },
        {
          id: "middle-school-ela",
          title: "Middle School ELA",
          courses: [
            {
              id: "literature-studies",
              title: "Literature Studies",
              description: "Analyze novels and literary elements through guided reading and interactive discussions.",
              gradeLevel: "6-8",
              aiFeatures: ["Character analysis tools", "Theme explorer", "Literary device identifier"],
              thumbnail: "/placeholder.svg?key=dyz2v",
              category: "ela",
              subcategory: "middle-school-ela",
            },
            {
              id: "composition-rhetoric",
              title: "Composition and Rhetoric",
              description: "Develop essay writing and persuasive techniques with structured guidance and feedback.",
              gradeLevel: "6-8",
              aiFeatures: ["Essay structure analyzer", "Argument strength evaluator", "Writing style coach"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=composition writing",
              category: "ela",
              subcategory: "middle-school-ela",
              new: true,
            },
            {
              id: "public-speaking",
              title: "Public Speaking",
              description: "Build presentation skills and speech writing through guided practice and feedback.",
              gradeLevel: "6-8",
              aiFeatures: ["Speech practice with feedback", "Presentation structure guide", "Delivery coach"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=public speaking",
              category: "ela",
              subcategory: "middle-school-ela",
            },
          ],
        },
        {
          id: "high-school-ela",
          title: "High School ELA",
          courses: [
            {
              id: "american-literature",
              title: "American Literature",
              description: "Study key American authors and literary movements through close reading and analysis.",
              gradeLevel: "9-10",
              aiFeatures: ["Historical context analyzer", "Author style comparison", "Theme development tracker"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=american literature",
              category: "ela",
              subcategory: "high-school-ela",
            },
            {
              id: "world-literature",
              title: "World Literature",
              description: "Explore global literary traditions and texts through comparative analysis and discussion.",
              gradeLevel: "10-11",
              aiFeatures: ["Cultural context explorer", "Translation comparison tools", "Global themes analyzer"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=world literature",
              category: "ela",
              subcategory: "high-school-ela",
            },
            {
              id: "ap-english-literature",
              title: "AP English Literature",
              description:
                "Prepare for the AP exam through literary analysis, critical theory, and timed writing practice.",
              gradeLevel: "12",
              aiFeatures: ["AP-style question generator", "Essay scoring and feedback", "Literary analysis coach"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AP English Literature",
              category: "ela",
              subcategory: "high-school-ela",
              popular: true,
            },
          ],
        },
      ],
    },
    {
      id: "social-studies",
      title: "Social Studies",
      description:
        "Engaging history, geography, and civics courses with interactive timelines, virtual field trips, and AI-powered historical simulations.",
      icon: <History className="h-5 w-5" />,
      subcategories: [
        {
          id: "elementary-social-studies",
          title: "Elementary Social Studies",
          courses: [
            {
              id: "community-citizenship",
              title: "Community and Citizenship",
              description: "Learn about family, neighborhood, and civic responsibility through interactive activities.",
              gradeLevel: "K-2",
              aiFeatures: ["Virtual community explorer", "Interactive citizenship scenarios", "Digital storytelling"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=community citizenship",
              category: "social-studies",
              subcategory: "elementary-social-studies",
            },
            {
              id: "us-history-kids",
              title: "U.S. History for Kids",
              description: "Discover American history highlights and figures through engaging stories and activities.",
              gradeLevel: "3-5",
              aiFeatures: ["Interactive timeline", "Historical figure conversations", "Primary source explorer"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=US history for kids",
              category: "social-studies",
              subcategory: "elementary-social-studies",
              popular: true,
            },
            {
              id: "geography-basics",
              title: "Geography Basics",
              description:
                "Explore maps, landforms, and global regions through interactive activities and virtual tours.",
              gradeLevel: "3-5",
              aiFeatures: ["Interactive map explorer", "Landform identification", "Virtual geography field trips"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=geography basics",
              category: "social-studies",
              subcategory: "elementary-social-studies",
            },
          ],
        },
        {
          id: "middle-school-social-studies",
          title: "Middle School Social Studies",
          courses: [
            {
              id: "ancient-civilizations",
              title: "Ancient Civilizations",
              description: "Study early human societies and achievements through immersive historical content.",
              gradeLevel: "6",
              aiFeatures: [
                "Virtual archaeological dig",
                "Ancient civilization simulator",
                "Historical artifact analyzer",
              ],
              thumbnail: "/placeholder.svg?height=200&width=300&query=ancient civilizations",
              category: "social-studies",
              subcategory: "middle-school-social-studies",
              new: true,
            },
            {
              id: "world-history-ms",
              title: "World History",
              description:
                "Explore medieval to modern global developments through interactive timelines and activities.",
              gradeLevel: "7",
              aiFeatures: ["Historical event simulator", "Interactive timeline creator", "Primary source analyzer"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=world history",
              category: "social-studies",
              subcategory: "middle-school-social-studies",
            },
            {
              id: "american-history-ms",
              title: "American History",
              description:
                "Study the Colonial era through Reconstruction with primary sources and interactive activities.",
              gradeLevel: "8",
              aiFeatures: [
                "Historical debate simulator",
                "Document-based question coach",
                "Virtual historical sites tour",
              ],
              thumbnail: "/placeholder.svg?height=200&width=300&query=american history",
              category: "social-studies",
              subcategory: "middle-school-social-studies",
            },
          ],
        },
        {
          id: "high-school-social-studies",
          title: "High School Social Studies",
          courses: [
            {
              id: "world-history-hs",
              title: "World History",
              description:
                "Analyze Renaissance to contemporary global events through critical analysis and discussion.",
              gradeLevel: "9-10",
              aiFeatures: [
                "Cause-effect relationship analyzer",
                "Historical perspective simulator",
                "Global impact evaluator",
              ],
              thumbnail: "/placeholder.svg?height=200&width=300&query=high school world history",
              category: "social-studies",
              subcategory: "high-school-social-studies",
            },
            {
              id: "us-history-hs",
              title: "U.S. History",
              description: "Examine Reconstruction to present day through primary sources and critical analysis.",
              gradeLevel: "10-11",
              aiFeatures: ["Historical document analyzer", "Policy impact simulator", "Historical debate coach"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=high school US history",
              category: "social-studies",
              subcategory: "high-school-social-studies",
            },
            {
              id: "government-politics",
              title: "U.S. Government and Politics",
              description: "Study political systems and civic engagement through case studies and simulations.",
              gradeLevel: "11-12",
              aiFeatures: ["Legislative process simulator", "Political system analyzer", "Policy debate coach"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=government politics",
              category: "social-studies",
              subcategory: "high-school-social-studies",
              popular: true,
            },
          ],
        },
      ],
    },
    {
      id: "stem",
      title: "STEM and Computer Science",
      description:
        "Innovative STEM and coding courses with hands-on projects, interactive coding environments, and AI-guided problem solving.",
      icon: <Code className="h-5 w-5" />,
      subcategories: [
        {
          id: "elementary-stem",
          title: "Elementary STEM",
          courses: [
            {
              id: "coding-kids",
              title: "Coding for Kids",
              description: "Introduction to block-based programming and computational thinking through fun activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Interactive coding challenges", "Automated code review", "Project-based learning"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=coding for kids",
              category: "stem",
              subcategory: "elementary-stem",
              popular: true,
            },
            {
              id: "stem-projects",
              title: "STEM Projects",
              description:
                "Engage in hands-on science and engineering activities with guided instructions and experiments.",
              gradeLevel: "K-5",
              aiFeatures: ["Virtual lab assistant", "Project customization", "Interactive experiment guides"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=STEM projects",
              category: "stem",
              subcategory: "elementary-stem",
            },
            {
              id: "digital-literacy",
              title: "Digital Literacy",
              description: "Learn basic computer skills and online safety through interactive lessons and activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Adaptive skill assessment", "Interactive safety scenarios", "Guided digital exploration"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=digital literacy",
              category: "stem",
              subcategory: "elementary-stem",
            },
          ],
        },
        {
          id: "middle-school-stem",
          title: "Middle School STEM",
          courses: [
            {
              id: "intro-programming",
              title: "Introduction to Programming",
              description: "Learn JavaScript and Python basics through interactive coding exercises and projects.",
              gradeLevel: "6-8",
              aiFeatures: ["Code analysis and feedback", "Personalized coding challenges", "Project-based learning"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=intro programming",
              category: "stem",
              subcategory: "middle-school-stem",
              new: true,
            },
            {
              id: "robotics-fundamentals",
              title: "Robotics Fundamentals",
              description: "Build and program simple robots through virtual simulations and optional physical kits.",
              gradeLevel: "6-8",
              aiFeatures: ["Virtual robot simulator", "Code optimization suggestions", "Robotics challenge generator"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=robotics fundamentals",
              category: "stem",
              subcategory: "middle-school-stem",
            },
            {
              id: "engineering-design",
              title: "Engineering Design",
              description: "Solve problems through the engineering process with guided projects and simulations.",
              gradeLevel: "6-8",
              aiFeatures: ["Design feedback assistant", "Virtual prototyping tools", "Engineering challenge generator"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=engineering design",
              category: "stem",
              subcategory: "middle-school-stem",
            },
          ],
        },
        {
          id: "high-school-stem",
          title: "High School STEM",
          courses: [
            {
              id: "ap-cs-principles",
              title: "AP Computer Science Principles",
              description: "Prepare for the AP exam through computing concepts and programming projects.",
              gradeLevel: "9-12",
              aiFeatures: ["AP practice problem generator", "Code review assistant", "Concept explanation engine"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AP Computer Science",
              category: "stem",
              subcategory: "high-school-stem",
              popular: true,
            },
            {
              id: "web-development",
              title: "Web Development",
              description: "Learn HTML, CSS, and JavaScript through project-based web development activities.",
              gradeLevel: "9-12",
              aiFeatures: ["Code suggestion engine", "Design feedback", "Interactive debugging assistant"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=web development",
              category: "stem",
              subcategory: "high-school-stem",
            },
            {
              id: "robotics-ai",
              title: "Robotics and AI",
              description: "Explore advanced robotics with AI applications through virtual simulations and projects.",
              gradeLevel: "10-12",
              aiFeatures: ["AI algorithm visualizer", "Robotics simulation environment", "Neural network playground"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=robotics and AI",
              category: "stem",
              subcategory: "high-school-stem",
            },
          ],
        },
      ],
    },
    {
      id: "arts-music",
      title: "Arts and Music",
      description:
        "Creative arts and music courses with virtual studios, AI-powered composition tools, and personalized feedback on artistic development.",
      icon: <Palette className="h-5 w-5" />,
      subcategories: [
        {
          id: "elementary-arts",
          title: "Elementary Arts",
          courses: [
            {
              id: "art-fundamentals",
              title: "Art Fundamentals",
              description: "Explore drawing, painting, and creative expression through guided projects and activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Virtual art studio", "Drawing technique guidance", "Creative prompt generator"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=art fundamentals",
              category: "arts-music",
              subcategory: "elementary-arts",
            },
            {
              id: "music-basics",
              title: "Music Basics",
              description: "Learn rhythm, melody, and musical appreciation through interactive lessons and activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Virtual instrument playground", "Rhythm training games", "Melody creation tools"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=music basics",
              category: "arts-music",
              subcategory: "elementary-arts",
              popular: true,
            },
            {
              id: "theater-drama",
              title: "Theater and Drama",
              description: "Develop performance skills and storytelling through guided activities and role-playing.",
              gradeLevel: "K-5",
              aiFeatures: ["Script generator", "Character creation tools", "Performance feedback"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=theater drama kids",
              category: "arts-music",
              subcategory: "elementary-arts",
            },
          ],
        },
        {
          id: "middle-school-arts",
          title: "Middle School Arts",
          courses: [
            {
              id: "visual-arts",
              title: "Visual Arts",
              description: "Develop advanced techniques and explore art history through guided projects and analysis.",
              gradeLevel: "6-8",
              aiFeatures: ["Art style analyzer", "Technique demonstration", "Virtual museum tours"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=visual arts",
              category: "arts-music",
              subcategory: "middle-school-arts",
            },
            {
              id: "music-theory",
              title: "Music Theory and Performance",
              description: "Learn instrument basics and music reading through interactive lessons and practice.",
              gradeLevel: "6-8",
              aiFeatures: ["Interactive notation practice", "Virtual instrument lessons", "Performance feedback"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=music theory",
              category: "arts-music",
              subcategory: "middle-school-arts",
              new: true,
            },
            {
              id: "digital-art",
              title: "Digital Art and Design",
              description: "Create computer-based art using digital tools and design principles with guided projects.",
              gradeLevel: "6-8",
              aiFeatures: ["Design assistant", "Digital art tutorials", "Style transfer tools"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=digital art",
              category: "arts-music",
              subcategory: "middle-school-arts",
            },
          ],
        },
        {
          id: "high-school-arts",
          title: "High School Arts",
          courses: [
            {
              id: "studio-art",
              title: "Studio Art",
              description:
                "Develop portfolio-quality artwork and advanced techniques through guided projects and feedback.",
              gradeLevel: "9-12",
              aiFeatures: ["Portfolio development assistant", "Technique analysis", "Style exploration tools"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=studio art",
              category: "arts-music",
              subcategory: "high-school-arts",
            },
            {
              id: "digital-media",
              title: "Digital Media Production",
              description: "Create video, audio, and multimedia content through project-based learning and tutorials.",
              gradeLevel: "9-12",
              aiFeatures: ["Video editing assistant", "Audio enhancement tools", "Content feedback"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=digital media production",
              category: "arts-music",
              subcategory: "high-school-arts",
              popular: true,
            },
            {
              id: "music-theory-advanced",
              title: "Music Theory",
              description: "Study advanced composition and analysis through interactive lessons and creative projects.",
              gradeLevel: "9-12",
              aiFeatures: ["Composition assistant", "Harmony analyzer", "Music generation tools"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=advanced music theory",
              category: "arts-music",
              subcategory: "high-school-arts",
            },
          ],
        },
      ],
    },
    {
      id: "languages",
      title: "Foreign Languages",
      description:
        "Comprehensive language courses in Spanish, Farsi, Russian, French, and Mandarin with AI-powered conversation practice and personalized vocabulary building.",
      icon: <Languages className="h-5 w-5" />,
      subcategories: [
        {
          id: "spanish",
          title: "Spanish",
          courses: [
            {
              id: "spanish-elementary",
              title: "Spanish for Elementary",
              description:
                "Introduction to Spanish vocabulary, basic phrases, and cultural elements through interactive activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Pronunciation coach", "Interactive conversations", "Vocabulary games"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=spanish for kids",
              category: "languages",
              subcategory: "spanish",
              popular: true,
            },
            {
              id: "spanish-middle",
              title: "Spanish I",
              description:
                "Develop foundational grammar and conversation skills through interactive lessons and practice.",
              gradeLevel: "6-8",
              aiFeatures: ["Conversation simulator", "Grammar coach", "Vocabulary builder"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=spanish middle school",
              category: "languages",
              subcategory: "spanish",
            },
            {
              id: "spanish-high",
              title: "Spanish I-IV",
              description: "Progressive language mastery from beginner to advanced levels with comprehensive practice.",
              gradeLevel: "9-12",
              aiFeatures: ["Advanced conversation practice", "Writing assistant", "Cultural immersion activities"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=spanish high school",
              category: "languages",
              subcategory: "spanish",
            },
          ],
        },
        {
          id: "farsi",
          title: "Farsi",
          courses: [
            {
              id: "farsi-elementary",
              title: "Farsi for Elementary",
              description:
                "Introduction to Farsi alphabet, basic vocabulary, and cultural elements through engaging activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Script practice assistant", "Interactive vocabulary builder", "Cultural stories"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=farsi for kids",
              category: "languages",
              subcategory: "farsi",
            },
            {
              id: "farsi-middle",
              title: "Farsi I",
              description:
                "Develop foundational grammar and conversation skills with interactive practice and cultural context.",
              gradeLevel: "6-8",
              aiFeatures: ["Script writing coach", "Pronunciation feedback", "Conversation practice"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=farsi middle school",
              category: "languages",
              subcategory: "farsi",
              new: true,
            },
            {
              id: "farsi-high",
              title: "Farsi I-IV",
              description:
                "Comprehensive Farsi language program from beginner to advanced levels with immersive practice.",
              gradeLevel: "9-12",
              aiFeatures: ["Advanced conversation simulator", "Writing assistant", "Literature exploration"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=farsi high school",
              category: "languages",
              subcategory: "farsi",
            },
          ],
        },
        {
          id: "russian",
          title: "Russian",
          courses: [
            {
              id: "russian-elementary",
              title: "Russian for Elementary",
              description:
                "Introduction to Cyrillic alphabet, basic vocabulary, and cultural elements through fun activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Alphabet trainer", "Interactive vocabulary games", "Cultural exploration"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=russian for kids",
              category: "languages",
              subcategory: "russian",
            },
            {
              id: "russian-middle",
              title: "Russian I",
              description:
                "Develop foundational grammar and conversation skills with interactive practice and cultural context.",
              gradeLevel: "6-8",
              aiFeatures: ["Cyrillic writing coach", "Pronunciation feedback", "Conversation practice"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=russian middle school",
              category: "languages",
              subcategory: "russian",
            },
            {
              id: "russian-high",
              title: "Russian I-IV",
              description:
                "Comprehensive Russian language program from beginner to advanced levels with immersive practice.",
              gradeLevel: "9-12",
              aiFeatures: ["Advanced conversation simulator", "Grammar coach", "Literature exploration"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=russian high school",
              category: "languages",
              subcategory: "russian",
            },
          ],
        },
        {
          id: "french",
          title: "French",
          courses: [
            {
              id: "french-elementary",
              title: "French for Elementary",
              description:
                "Introduction to French vocabulary, basic phrases, and cultural elements through interactive activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Pronunciation coach", "Interactive vocabulary games", "Cultural stories"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=french for kids",
              category: "languages",
              subcategory: "french",
            },
            {
              id: "french-middle",
              title: "French I",
              description:
                "Develop foundational grammar and conversation skills through interactive lessons and practice.",
              gradeLevel: "6-8",
              aiFeatures: ["Conversation simulator", "Grammar coach", "Vocabulary builder"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=french middle school",
              category: "languages",
              subcategory: "french",
            },
            {
              id: "french-high",
              title: "French I-IV",
              description:
                "Progressive French language mastery from beginner to advanced levels with comprehensive practice.",
              gradeLevel: "9-12",
              aiFeatures: ["Advanced conversation practice", "Writing assistant", "Cultural immersion activities"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=french high school",
              category: "languages",
              subcategory: "french",
              popular: true,
            },
          ],
        },
        {
          id: "mandarin",
          title: "Mandarin",
          courses: [
            {
              id: "mandarin-elementary",
              title: "Mandarin for Elementary",
              description:
                "Introduction to Mandarin characters, basic vocabulary, and cultural elements through engaging activities.",
              gradeLevel: "K-5",
              aiFeatures: ["Character writing coach", "Tone recognition practice", "Interactive vocabulary games"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=mandarin for kids",
              category: "languages",
              subcategory: "mandarin",
            },
            {
              id: "mandarin-middle",
              title: "Mandarin I",
              description: "Develop foundational character writing and conversation skills with interactive practice.",
              gradeLevel: "6-8",
              aiFeatures: ["Character recognition trainer", "Pronunciation feedback", "Conversation practice"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=mandarin middle school",
              category: "languages",
              subcategory: "mandarin",
            },
            {
              id: "mandarin-high",
              title: "Mandarin I-IV",
              description:
                "Comprehensive Mandarin program from beginner to advanced levels with character mastery and conversation.",
              gradeLevel: "9-12",
              aiFeatures: ["Advanced character writing coach", "Conversation simulator", "Cultural context explorer"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=mandarin high school",
              category: "languages",
              subcategory: "mandarin",
            },
          ],
        },
      ],
    },
    {
      id: "sped",
      title: "Special Education",
      description:
        "Specialized courses designed to support diverse learning needs with adaptive pacing, multi-modal content delivery, and AI-powered personalization.",
      icon: <Users className="h-5 w-5" />,
      subcategories: [
        {
          id: "reading-intervention",
          title: "Reading Intervention",
          courses: [
            {
              id: "early-reading-intervention",
              title: "Early Reading Intervention",
              description:
                "Targeted support for emerging readers with phonics, decoding, and comprehension strategies.",
              gradeLevel: "K-3",
              aiFeatures: [
                "Adaptive reading level assessment",
                "Personalized skill practice",
                "Multi-sensory learning activities",
              ],
              thumbnail: "/placeholder.svg?height=200&width=300&query=reading intervention",
              category: "sped",
              subcategory: "reading-intervention",
              popular: true,
            },
            {
              id: "intermediate-reading-support",
              title: "Intermediate Reading Support",
              description: "Targeted strategies for developing fluency, vocabulary, and comprehension skills.",
              gradeLevel: "4-8",
              aiFeatures: ["Reading fluency coach", "Vocabulary building tools", "Text-to-speech with highlighting"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=reading support",
              category: "sped",
              subcategory: "reading-intervention",
            },
            {
              id: "advanced-reading-strategies",
              title: "Advanced Reading Strategies",
              description:
                "Support for secondary students with reading challenges through specialized techniques and tools.",
              gradeLevel: "9-12",
              aiFeatures: ["Content summarization tools", "Reading strategy coach", "Customized text complexity"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=reading strategies",
              category: "sped",
              subcategory: "reading-intervention",
            },
          ],
        },
        {
          id: "math-intervention",
          title: "Math Intervention",
          courses: [
            {
              id: "early-math-intervention",
              title: "Early Math Intervention",
              description: "Targeted support for foundational math skills with concrete strategies and visual models.",
              gradeLevel: "K-3",
              aiFeatures: ["Skill gap analyzer", "Visual math models", "Adaptive practice generator"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=math intervention",
              category: "sped",
              subcategory: "math-intervention",
            },
            {
              id: "intermediate-math-support",
              title: "Intermediate Math Support",
              description: "Targeted strategies for developing number sense, operations, and problem-solving skills.",
              gradeLevel: "4-8",
              aiFeatures: ["Step-by-step problem solver", "Visual math tools", "Personalized practice"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=math support",
              category: "sped",
              subcategory: "math-intervention",
              new: true,
            },
            {
              id: "advanced-math-strategies",
              title: "Advanced Math Strategies",
              description:
                "Support for secondary students with math challenges through specialized techniques and tools.",
              gradeLevel: "9-12",
              aiFeatures: ["Concept visualization tools", "Formula explanation engine", "Adaptive practice"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=math strategies",
              category: "sped",
              subcategory: "math-intervention",
            },
          ],
        },
        {
          id: "executive-functioning",
          title: "Executive Functioning",
          courses: [
            {
              id: "organization-skills",
              title: "Organization and Planning Skills",
              description: "Develop strategies for organization, time management, and planning across academic areas.",
              gradeLevel: "K-12",
              aiFeatures: ["Digital planner assistant", "Task breakdown tools", "Routine builder"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=organization skills",
              category: "sped",
              subcategory: "executive-functioning",
            },
            {
              id: "study-skills",
              title: "Study Skills Development",
              description: "Learn effective study techniques, note-taking strategies, and test preparation methods.",
              gradeLevel: "4-12",
              aiFeatures: ["Note-taking assistant", "Study schedule generator", "Memory technique coach"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=study skills",
              category: "sped",
              subcategory: "executive-functioning",
            },
            {
              id: "social-skills",
              title: "Social Skills Development",
              description:
                "Build positive peer relationships and communication skills through guided practice and scenarios.",
              gradeLevel: "K-12",
              aiFeatures: ["Social scenario simulator", "Emotion recognition tools", "Communication coach"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=social skills",
              category: "sped",
              subcategory: "executive-functioning",
              popular: true,
            },
          ],
        },
      ],
    },
    {
      id: "test-prep",
      title: "Test Preparation",
      description:
        "Comprehensive test preparation courses with practice exams, personalized study plans, and AI-powered performance analysis.",
      icon: <GraduationCap className="h-5 w-5" />,
      subcategories: [
        {
          id: "standardized-tests",
          title: "Standardized Tests",
          courses: [
            {
              id: "sat-prep",
              title: "SAT Preparation",
              description:
                "Comprehensive preparation for all SAT sections with practice tests and targeted strategies.",
              gradeLevel: "10-12",
              aiFeatures: ["Personalized study plan", "Question analysis", "Score prediction"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=SAT prep",
              category: "test-prep",
              subcategory: "standardized-tests",
              popular: true,
            },
            {
              id: "act-prep",
              title: "ACT Preparation",
              description:
                "Strategies and practice for ACT success across all test sections with personalized coaching.",
              gradeLevel: "10-12",
              aiFeatures: ["Timing strategy coach", "Weakness identifier", "Practice test analyzer"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=ACT prep",
              category: "test-prep",
              subcategory: "standardized-tests",
            },
            {
              id: "psat-prep",
              title: "PSAT/NMSQT Preparation",
              description:
                "Targeted preparation for the PSAT with strategies for National Merit Scholarship qualification.",
              gradeLevel: "9-11",
              aiFeatures: ["Skill gap analyzer", "Practice question generator", "Performance tracker"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=PSAT prep",
              category: "test-prep",
              subcategory: "standardized-tests",
            },
          ],
        },
        {
          id: "ap-exams",
          title: "AP Exams",
          courses: [
            {
              id: "ap-calc-prep",
              title: "AP Calculus Exam Prep",
              description: "Targeted preparation for AP Calculus AB and BC exams with practice problems and review.",
              gradeLevel: "11-12",
              aiFeatures: ["Concept explanation engine", "FRQ practice with feedback", "Personalized review plan"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AP Calculus",
              category: "test-prep",
              subcategory: "ap-exams",
            },
            {
              id: "ap-bio-prep",
              title: "AP Biology Exam Prep",
              description: "Comprehensive review of AP Biology concepts with practice questions and lab simulations.",
              gradeLevel: "11-12",
              aiFeatures: ["Virtual lab simulator", "Concept map generator", "FRQ writing coach"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AP Biology",
              category: "test-prep",
              subcategory: "ap-exams",
              new: true,
            },
            {
              id: "ap-history-prep",
              title: "AP History Exam Prep",
              description: "Targeted preparation for AP U.S. History, World History, and European History exams.",
              gradeLevel: "10-12",
              aiFeatures: ["Document analysis coach", "Essay structure guide", "Timeline generator"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AP History",
              category: "test-prep",
              subcategory: "ap-exams",
            },
          ],
        },
        {
          id: "state-assessments",
          title: "State Assessments",
          courses: [
            {
              id: "elementary-assessment-prep",
              title: "Elementary State Assessment Prep",
              description: "Targeted preparation for state standardized tests in math, reading, and writing.",
              gradeLevel: "3-5",
              aiFeatures: ["Test format familiarization", "Skill gap analyzer", "Personalized practice"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=elementary assessment",
              category: "test-prep",
              subcategory: "state-assessments",
            },
            {
              id: "middle-assessment-prep",
              title: "Middle School State Assessment Prep",
              description: "Comprehensive preparation for state standardized tests across all core subject areas.",
              gradeLevel: "6-8",
              aiFeatures: ["Test-taking strategy coach", "Targeted skill practice", "Performance predictor"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=middle school assessment",
              category: "test-prep",
              subcategory: "state-assessments",
            },
            {
              id: "high-assessment-prep",
              title: "High School State Assessment Prep",
              description: "Targeted preparation for high school graduation exams and state assessments.",
              gradeLevel: "9-12",
              aiFeatures: ["Content review generator", "Practice test analyzer", "Personalized study plan"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=high school assessment",
              category: "test-prep",
              subcategory: "state-assessments",
              popular: true,
            },
          ],
        },
      ],
    },
    {
      id: "electives",
      title: "Electives and Enrichment",
      description:
        "Diverse elective courses in financial literacy, health, career exploration, and more with interactive simulations and AI-guided projects.",
      icon: <Lightbulb className="h-5 w-5" />,
      subcategories: [
        {
          id: "life-skills",
          title: "Life Skills",
          courses: [
            {
              id: "financial-literacy",
              title: "Financial Literacy",
              description:
                "Learn money management and personal finance through interactive simulations and activities.",
              gradeLevel: "6-12",
              aiFeatures: ["Budget simulator", "Investment calculator", "Financial decision scenarios"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=financial literacy",
              category: "electives",
              subcategory: "life-skills",
              popular: true,
            },
            {
              id: "health-wellness",
              title: "Health and Wellness",
              description: "Explore nutrition, fitness, and mental health through interactive lessons and activities.",
              gradeLevel: "K-12",
              aiFeatures: ["Nutrition analyzer", "Fitness plan generator", "Wellness tracker"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=health wellness",
              category: "electives",
              subcategory: "life-skills",
            },
            {
              id: "digital-citizenship",
              title: "Digital Citizenship",
              description: "Develop responsible online behavior, media literacy, and digital safety awareness.",
              gradeLevel: "3-12",
              aiFeatures: ["Online safety simulator", "Media fact-checker", "Digital footprint analyzer"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=digital citizenship",
              category: "electives",
              subcategory: "life-skills",
            },
          ],
        },
        {
          id: "career-exploration",
          title: "Career Exploration",
          courses: [
            {
              id: "career-pathways",
              title: "Career Pathways",
              description: "Explore potential career paths through interactive activities and virtual job shadowing.",
              gradeLevel: "6-12",
              aiFeatures: ["Career interest analyzer", "Virtual job shadowing", "Education path planner"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=career pathways",
              category: "electives",
              subcategory: "career-exploration",
            },
            {
              id: "entrepreneurship",
              title: "Entrepreneurship",
              description:
                "Learn business fundamentals and develop entrepreneurial skills through project-based activities.",
              gradeLevel: "8-12",
              aiFeatures: ["Business plan generator", "Market analysis tools", "Startup simulator"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=entrepreneurship",
              category: "electives",
              subcategory: "career-exploration",
              new: true,
            },
            {
              id: "college-prep",
              title: "College Preparation",
              description: "Navigate the college application process and prepare for higher education success.",
              gradeLevel: "9-12",
              aiFeatures: ["College match finder", "Essay writing coach", "Application tracker"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=college prep",
              category: "electives",
              subcategory: "career-exploration",
            },
          ],
        },
        {
          id: "communication-skills",
          title: "Communication Skills",
          courses: [
            {
              id: "debate",
              title: "Debate and Public Speaking",
              description: "Develop argumentation and presentation skills through guided practice and feedback.",
              gradeLevel: "6-12",
              aiFeatures: ["Argument structure analyzer", "Speech practice with feedback", "Debate simulator"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=debate public speaking",
              category: "electives",
              subcategory: "communication-skills",
            },
            {
              id: "journalism",
              title: "Journalism",
              description: "Learn news writing, media literacy, and reporting skills through hands-on projects.",
              gradeLevel: "7-12",
              aiFeatures: ["Article structure guide", "Interview question generator", "Media bias analyzer"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=journalism",
              category: "electives",
              subcategory: "communication-skills",
            },
            {
              id: "creative-writing",
              title: "Creative Writing Workshop",
              description: "Develop creative writing skills across multiple genres with guided practice and feedback.",
              gradeLevel: "4-12",
              aiFeatures: ["Story prompt generator", "Writing style analyzer", "Feedback assistant"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=creative writing",
              category: "electives",
              subcategory: "communication-skills",
              popular: true,
            },
          ],
        },
      ],
    },
    {
      id: "ai-enhanced",
      title: "AI-Enhanced Learning",
      description:
        "Specialized courses leveraging advanced AI technologies for personalized learning experiences, intelligent tutoring, and adaptive content delivery.",
      icon: <Bot className="h-5 w-5" />,
      subcategories: [
        {
          id: "ai-tutoring",
          title: "AI Tutoring",
          courses: [
            {
              id: "math-ai-tutor",
              title: "Math AI Tutor",
              description: "Personalized math tutoring with step-by-step guidance and adaptive problem solving.",
              gradeLevel: "K-12",
              aiFeatures: ["Personalized learning path", "Step-by-step problem solving", "Misconception detection"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AI math tutor",
              category: "ai-enhanced",
              subcategory: "ai-tutoring",
              popular: true,
            },
            {
              id: "writing-ai-coach",
              title: "Writing AI Coach",
              description: "Develop writing skills with personalized feedback, suggestions, and guided practice.",
              gradeLevel: "3-12",
              aiFeatures: ["Real-time writing feedback", "Structure suggestions", "Grammar and style coaching"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AI writing coach",
              category: "ai-enhanced",
              subcategory: "ai-tutoring",
            },
            {
              id: "science-ai-lab",
              title: "Science AI Lab Assistant",
              description: "Virtual science lab with guided experiments, simulations, and personalized explanations.",
              gradeLevel: "5-12",
              aiFeatures: ["Virtual experiment guide", "Concept explanation engine", "Hypothesis testing assistant"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AI science lab",
              category: "ai-enhanced",
              subcategory: "ai-tutoring",
            },
          ],
        },
        {
          id: "adaptive-learning",
          title: "Adaptive Learning",
          courses: [
            {
              id: "personalized-reading",
              title: "Personalized Reading Journey",
              description: "Adaptive reading program that adjusts content and activities based on individual progress.",
              gradeLevel: "K-8",
              aiFeatures: ["Reading level adaptation", "Interest-based text selection", "Skill-focused activities"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=personalized reading",
              category: "ai-enhanced",
              subcategory: "adaptive-learning",
            },
            {
              id: "adaptive-math",
              title: "Adaptive Math Pathways",
              description: "Personalized math curriculum that adapts to individual learning needs and pace.",
              gradeLevel: "K-12",
              aiFeatures: ["Skill gap identification", "Custom learning path", "Adaptive difficulty"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=adaptive math",
              category: "ai-enhanced",
              subcategory: "adaptive-learning",
              new: true,
            },
            {
              id: "language-acquisition",
              title: "AI Language Acquisition",
              description: "Adaptive language learning program with personalized practice and conversation simulation.",
              gradeLevel: "K-12",
              aiFeatures: ["Conversation simulator", "Pronunciation coach", "Personalized vocabulary builder"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AI language learning",
              category: "ai-enhanced",
              subcategory: "adaptive-learning",
            },
          ],
        },
        {
          id: "ai-projects",
          title: "AI-Guided Projects",
          courses: [
            {
              id: "ai-research-assistant",
              title: "AI Research Assistant",
              description: "Learn research skills with AI-guided project development and information analysis.",
              gradeLevel: "6-12",
              aiFeatures: ["Research question generator", "Source evaluation guide", "Information synthesis tools"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AI research",
              category: "ai-enhanced",
              subcategory: "ai-projects",
            },
            {
              id: "creative-ai-collaboration",
              title: "Creative AI Collaboration",
              description: "Develop creative projects with AI assistance in writing, art, music, and multimedia.",
              gradeLevel: "3-12",
              aiFeatures: ["Creative prompt generator", "Style suggestion engine", "Collaborative creation tools"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=creative AI",
              category: "ai-enhanced",
              subcategory: "ai-projects",
              popular: true,
            },
            {
              id: "ai-coding-companion",
              title: "AI Coding Companion",
              description: "Learn programming with personalized guidance, code suggestions, and project support.",
              gradeLevel: "4-12",
              aiFeatures: ["Code suggestion engine", "Error explanation", "Project scaffolding"],
              thumbnail: "/placeholder.svg?height=200&width=300&query=AI coding",
              category: "ai-enhanced",
              subcategory: "ai-projects",
            },
          ],
        },
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Course Catalog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Explore our comprehensive K-12 education courses enhanced with AI-powered learning tools
        </p>

        {/* Search and filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search courses by title, description, or grade level..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* AI Course Recommendations */}
      <CourseRecommendations
        courses={categories.flatMap((category) => category.subcategories.flatMap((subcategory) => subcategory.courses))}
      />

      <Tabs defaultValue="all" onValueChange={setActiveCategory}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-6" aria-label="Course categories">
            <TabsTrigger value="all" className="min-w-max">
              All Courses
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="min-w-max flex items-center gap-1"
                aria-label={`${category.title} category`}
              >
                {category.icon}
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12" aria-live="polite">
              <div className="mb-4">
                <Search className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No courses found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or browse by category</p>
              <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
            </div>
          )}
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{category.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
            </div>

            <Accordion type="multiple" defaultValue={[category.subcategories[0]?.id]} className="mb-8">
              {category.subcategories.map((subcategory) => (
                <AccordionItem key={subcategory.id} value={subcategory.id}>
                  <AccordionTrigger className="text-lg font-medium">{subcategory.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                      {subcategory.courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// Course card component
function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <Image
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {course.popular && <Badge className="bg-yellow-500 hover:bg-yellow-600">Popular</Badge>}
          {course.new && <Badge className="bg-green-500 hover:bg-green-600">New</Badge>}
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className="text-xs">
            Grades {course.gradeLevel}
          </Badge>
          <span className="text-xs text-gray-500">{course.category}</span>
        </div>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-2 flex-grow">
        <div className="space-y-2">
          <p className="text-sm font-medium">AI-Enhanced Features:</p>
          <ul className="space-y-1">
            {course.aiFeatures.slice(0, 2).map((feature, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <Brain className="h-3 w-3 mr-1 text-primary" />
                {feature}
              </li>
            ))}
            {course.aiFeatures.length > 2 && (
              <li className="text-xs text-gray-600 dark:text-gray-400">
                +{course.aiFeatures.length - 2} more features
              </li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Button className="w-full">
          View Course
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
