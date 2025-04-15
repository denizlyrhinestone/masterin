"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BookOpen, ChevronDown, ChevronRight, CheckCircle, Search, Menu, X, ArrowLeft, ArrowRight } from "lucide-react"

export default function CoursePage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [expandedUnits, setExpandedUnits] = useState<string[]>(["unit-1"])
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  const currentLesson = {
    id: "lesson-1-1",
    title: "What is life?",
    description:
      "In this introductory lesson, we explore the fundamental characteristics that define living organisms and distinguish them from non-living things. We'll examine the basic properties all living things share and begin to understand the complexity and diversity of life on Earth.",
    transcript: `
      Welcome to our first lesson in Biology! Today we're going to tackle a seemingly simple but profound question: What is life?

      At first glance, this might seem obvious. We all recognize living things when we see them, right? But when scientists try to define life precisely, it gets complicated.

      Generally, biologists agree that living organisms share several key characteristics:

      First, all living things are composed of cells - the basic structural units of life. Some organisms consist of just one cell, while others, like humans, have trillions.

      Second, living things maintain homeostasis - they regulate their internal environment to keep conditions stable and optimal for survival.

      Third, living organisms grow and develop over time, changing in predictable ways.

      Fourth, all living things respond to stimuli - they react to changes in their environment.

      Fifth, living organisms reproduce, creating offspring similar to themselves.

      Sixth, living things adapt to their environment over generations through evolution.

      And seventh, living organisms require energy, which they obtain through metabolism.

      These characteristics help us distinguish between living and non-living things, though the boundaries can sometimes blur. Viruses, for example, challenge our definition because they have some but not all characteristics of living things.

      As we progress through this course, we'll explore each of these characteristics in depth and examine the incredible diversity of life forms that exist on our planet.

      In our next lesson, we'll dive deeper into the cell - the fundamental unit of life - and explore its structure and function.
    `,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "/placeholder.svg?height=720&width=1280",
    unitId: "unit-1",
    unitTitle: "Introduction to Biology",
    nextLesson: "lesson-1-2",
    prevLesson: null,
    nextLessonTitle: "The Cell: Basic Unit of Life",
    prevLessonTitle: null,
  }

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => (prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]))
  }

  const toggleLessonCompletion = (lessonId: string) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId],
    )
  }

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev)
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="flex h-16 items-center px-4 md:px-6">
          <button
            onClick={toggleMobileSidebar}
            className="mr-2 rounded-md p-2 text-slate-800 hover:bg-slate-100 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 md:mr-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="hidden font-bold text-xl md:inline-block">LearnWise</span>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="w-full rounded-full bg-slate-50 pl-8 focus-visible:ring-blue-500"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-slate-500">john.doe@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>My Courses</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={toggleMobileSidebar} />
            <div className="relative flex w-80 max-w-[calc(100%-3rem)] flex-1 flex-col bg-white">
              <div className="flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span className="font-bold text-xl">LearnWise</span>
                </Link>
                <button
                  onClick={toggleMobileSidebar}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <CourseSidebar
                  expandedUnits={expandedUnits}
                  toggleUnit={toggleUnit}
                  currentLessonId={currentLesson.id}
                  completedLessons={completedLessons}
                />
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside
          className={`hidden border-r bg-white md:block ${
            sidebarOpen ? "w-80" : "w-16"
          } transition-all duration-300 ease-in-out`}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4">
              {sidebarOpen ? (
                <button
                  onClick={toggleSidebar}
                  className="ml-auto rounded-md p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={toggleSidebar}
                  className="mx-auto rounded-md p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-auto p-4">
                <CourseSidebar
                  expandedUnits={expandedUnits}
                  toggleUnit={toggleUnit}
                  currentLessonId={currentLesson.id}
                  completedLessons={completedLessons}
                />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
            <div className="mb-6">
              <div className="text-sm text-slate-500 mb-2">
                {currentLesson.unitTitle} &gt; {currentLesson.title}
              </div>
              <h1 className="text-2xl font-bold md:text-3xl">{currentLesson.title}</h1>
              <p className="mt-2 text-slate-600">{currentLesson.description}</p>
            </div>

            {/* Video Player */}
            <div className="mb-6 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
              <div className="aspect-video relative">
                <Image
                  src={currentLesson.thumbnailUrl || "/placeholder.svg"}
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">Play Video</Button>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="mb-8 rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Lesson Transcript</h2>
              <div className="max-h-80 overflow-y-auto pr-2 text-slate-700">
                {currentLesson.transcript.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={() => toggleLessonCompletion(currentLesson.id)}
                className={`flex items-center gap-2 ${
                  completedLessons.includes(currentLesson.id)
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                {completedLessons.includes(currentLesson.id) ? "Completed" : "Mark as Complete"}
              </Button>

              <div className="flex gap-2">
                {currentLesson.prevLesson && (
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <Link href={`/course-viewer/${params.id}?lesson=${currentLesson.prevLesson}`}>
                      <ArrowLeft className="h-4 w-4" />
                      Previous Lesson
                    </Link>
                  </Button>
                )}

                {currentLesson.nextLesson && (
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href={`/course-viewer/${params.id}?lesson=${currentLesson.nextLesson}`}>
                      Next Lesson
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function CourseSidebar({
  expandedUnits,
  toggleUnit,
  currentLessonId,
  completedLessons,
}: {
  expandedUnits: string[]
  toggleUnit: (unitId: string) => void
  currentLessonId: string
  completedLessons: string[]
}) {
  const courseUnits = [
    {
      id: "unit-1",
      title: "Unit 1: Introduction to Biology",
      lessons: [
        { id: "lesson-1-1", title: "What is life?" },
        { id: "lesson-1-2", title: "The Cell: Basic Unit of Life" },
        { id: "lesson-1-3", title: "Biological Classification" },
        { id: "lesson-1-4", title: "Evolution and Natural Selection" },
      ],
    },
    {
      id: "unit-2",
      title: "Unit 2: Cell Biology",
      lessons: [
        { id: "lesson-2-1", title: "Cell Structure and Function" },
        { id: "lesson-2-2", title: "Cell Membrane and Transport" },
        { id: "lesson-2-3", title: "Cellular Respiration" },
        { id: "lesson-2-4", title: "Photosynthesis" },
      ],
    },
    {
      id: "unit-3",
      title: "Unit 3: Genetics",
      lessons: [
        { id: "lesson-3-1", title: "DNA Structure and Replication" },
        { id: "lesson-3-2", title: "Protein Synthesis" },
        { id: "lesson-3-3", title: "Mendelian Genetics" },
        { id: "lesson-3-4", title: "Genetic Engineering" },
      ],
    },
    {
      id: "unit-4",
      title: "Unit 4: Human Physiology",
      lessons: [
        { id: "lesson-4-1", title: "Digestive System" },
        { id: "lesson-4-2", title: "Circulatory System" },
        { id: "lesson-4-3", title: "Respiratory System" },
        { id: "lesson-4-4", title: "Nervous System" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="font-semibold text-lg">Biology 101</div>
      <div className="space-y-1">
        {courseUnits.map((unit) => (
          <Collapsible
            key={unit.id}
            open={expandedUnits.includes(unit.id)}
            className="border rounded-md overflow-hidden"
          >
            <CollapsibleTrigger
              onClick={() => toggleUnit(unit.id)}
              className="flex w-full items-center justify-between p-3 font-medium hover:bg-slate-50"
            >
              <span className="text-sm">{unit.title}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${expandedUnits.includes(unit.id) ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="border-t bg-slate-50 py-2">
                {unit.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`#${lesson.id}`}
                      className={`flex items-center gap-2 px-4 py-2 text-sm ${
                        currentLessonId === lesson.id ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-100"
                      }`}
                    >
                      {completedLessons.includes(lesson.id) ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-300 flex-shrink-0" />
                      )}
                      <span>{lesson.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
