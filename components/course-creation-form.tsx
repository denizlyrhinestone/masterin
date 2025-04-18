"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Upload, Plus, FileText, Video, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

// Define the form schema with zod
const courseFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  subtitle: z.string().min(10, { message: "Subtitle must be at least 10 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  subcategory: z.string().optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"]),
  price: z.coerce.number().min(0).optional(),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  thumbnailUrl: z.string().optional(),
  previewVideoUrl: z.string().optional(),
  learningObjectives: z.array(z.string()).min(1, { message: "Add at least one learning objective" }),
})

type CourseFormValues = z.infer<typeof courseFormSchema>

// Sample categories for the dropdown
const categories = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "computer-science", label: "Computer Science" },
  { value: "language", label: "Language & Literature" },
  { value: "history", label: "History" },
  { value: "arts", label: "Arts & Music" },
]

// Sample subcategories
const subcategories: Record<string, { value: string; label: string }[]> = {
  mathematics: [
    { value: "algebra", label: "Algebra" },
    { value: "calculus", label: "Calculus" },
    { value: "geometry", label: "Geometry" },
    { value: "statistics", label: "Statistics" },
  ],
  science: [
    { value: "biology", label: "Biology" },
    { value: "chemistry", label: "Chemistry" },
    { value: "physics", label: "Physics" },
    { value: "earth-science", label: "Earth Science" },
  ],
  "computer-science": [
    { value: "programming", label: "Programming" },
    { value: "web-development", label: "Web Development" },
    { value: "data-science", label: "Data Science" },
    { value: "artificial-intelligence", label: "Artificial Intelligence" },
  ],
}

export function CourseCreationForm({ courseId }: { courseId?: string }) {
  const router = useRouter()
  const isEditing = !!courseId
  const [activeTab, setActiveTab] = useState("basic")
  const [modules, setModules] = useState<
    { title: string; description: string; lessons: { title: string; type: string }[] }[]
  >([
    {
      title: "Introduction",
      description: "Getting started with the course",
      lessons: [
        { title: "Welcome to the course", type: "video" },
        { title: "Course overview", type: "video" },
      ],
    },
  ])
  const [resources, setResources] = useState<{ title: string; type: string; url: string }[]>([])
  const [currentObjective, setCurrentObjective] = useState("")

  // Initialize form with default values or existing course data
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      category: "",
      level: "Beginner",
      isFree: true,
      isPublished: false,
      isFeatured: false,
      learningObjectives: [],
    },
  })

  // Handle form submission
  function onSubmit(data: CourseFormValues) {
    // In a real app, this would send data to an API
    console.log("Form submitted:", { ...data, modules, resources })

    toast({
      title: isEditing ? "Course updated" : "Course created",
      description: `${data.title} has been ${isEditing ? "updated" : "created"} successfully.`,
    })

    // Redirect to the course management page
    router.push("/educator/courses")
  }

  // Add a new module
  const addModule = () => {
    setModules([...modules, { title: "", description: "", lessons: [] }])
  }

  // Remove a module
  const removeModule = (index: number) => {
    const newModules = [...modules]
    newModules.splice(index, 1)
    setModules(newModules)
  }

  // Add a new lesson to a module
  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules]
    newModules[moduleIndex].lessons.push({ title: "", type: "video" })
    setModules(newModules)
  }

  // Remove a lesson from a module
  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules]
    newModules[moduleIndex].lessons.splice(lessonIndex, 1)
    setModules(newModules)
  }

  // Update module data
  const updateModule = (index: number, field: string, value: string) => {
    const newModules = [...modules]
    newModules[index][field as keyof (typeof newModules)[0]] = value
    setModules(newModules)
  }

  // Update lesson data
  const updateLesson = (moduleIndex: number, lessonIndex: number, field: string, value: string) => {
    const newModules = [...modules]
    newModules[moduleIndex].lessons[lessonIndex][field as keyof (typeof newModules)[0]["lessons"][0]] = value
    setModules(newModules)
  }

  // Add a new resource
  const addResource = () => {
    setResources([...resources, { title: "", type: "pdf", url: "" }])
  }

  // Remove a resource
  const removeResource = (index: number) => {
    const newResources = [...resources]
    newResources.splice(index, 1)
    setResources(newResources)
  }

  // Update resource data
  const updateResource = (index: number, field: string, value: string) => {
    const newResources = [...resources]
    newResources[index][field as keyof (typeof newResources)[0]] = value
    setResources(newResources)
  }

  // Add a learning objective
  const addLearningObjective = () => {
    if (currentObjective.trim()) {
      const currentObjectives = form.getValues("learningObjectives") || []
      form.setValue("learningObjectives", [...currentObjectives, currentObjective])
      setCurrentObjective("")
    }
  }

  // Remove a learning objective
  const removeLearningObjective = (index: number) => {
    const currentObjectives = form.getValues("learningObjectives") || []
    const newObjectives = [...currentObjectives]
    newObjectives.splice(index, 1)
    form.setValue("learningObjectives", newObjectives)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Course" : "Create New Course"}</h1>
        <p className="text-muted-foreground">
          {isEditing
            ? "Update your course details, curriculum, and resources"
            : "Fill in the details below to create your new course"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Introduction to Algebra" {...field} />
                          </FormControl>
                          <FormDescription>
                            A clear, specific title that describes what students will learn
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Subtitle</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Master algebraic concepts and problem-solving techniques"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>A brief description that appears below the title</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what your course covers and what students will learn..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A detailed description of your course content and learning outcomes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>The main subject area of your course</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!form.watch("category")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subcategory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {form.watch("category") &&
                                  subcategories[form.watch("category")]?.map((subcategory) => (
                                    <SelectItem key={subcategory.value} value={subcategory.value}>
                                      {subcategory.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>A more specific topic within the category</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="All Levels">All Levels</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>The experience level required for students</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Course Thumbnail</FormLabel>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="h-40 w-64 overflow-hidden rounded-md border bg-muted">
                          <div className="flex h-full w-full items-center justify-center">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Thumbnail
                        </Button>
                      </div>
                      <FormDescription className="mt-2">Recommended size: 1280x720 pixels (16:9 ratio)</FormDescription>
                    </div>

                    <div>
                      <FormLabel>Learning Objectives</FormLabel>
                      <FormDescription className="mt-1 mb-3">
                        Add specific learning outcomes that students will achieve
                      </FormDescription>

                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="e.g., Understand the basics of algebraic expressions"
                          value={currentObjective}
                          onChange={(e) => setCurrentObjective(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addLearningObjective()
                            }
                          }}
                        />
                        <Button type="button" onClick={addLearningObjective}>
                          Add
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {form.watch("learningObjectives")?.map((objective, index) => (
                          <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                            <div className="flex-1">{objective}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLearningObjective(index)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {form.formState.errors.learningObjectives && (
                        <p className="text-sm font-medium text-destructive mt-2">
                          {form.formState.errors.learningObjectives.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Course Curriculum</h3>
                      <p className="text-sm text-muted-foreground">Organize your course into modules and lessons</p>
                    </div>
                    <Button type="button" onClick={addModule}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Module
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="rounded-md border p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-md font-medium">Module {moduleIndex + 1}</h4>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeModule(moduleIndex)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <FormLabel>Module Title</FormLabel>
                              <Input
                                placeholder="e.g., Introduction to Algebra"
                                value={module.title}
                                onChange={(e) => updateModule(moduleIndex, "title", e.target.value)}
                              />
                            </div>
                            <div>
                              <FormLabel>Module Description</FormLabel>
                              <Input
                                placeholder="e.g., Getting started with algebraic concepts"
                                value={module.description}
                                onChange={(e) => updateModule(moduleIndex, "description", e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <FormLabel>Lessons</FormLabel>
                              <Button type="button" variant="outline" size="sm" onClick={() => addLesson(moduleIndex)}>
                                <Plus className="mr-2 h-3 w-3" />
                                Add Lesson
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="flex items-center gap-2 rounded-md border p-2">
                                  <div className="flex-1">
                                    <Input
                                      placeholder="Lesson title"
                                      value={lesson.title}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, "title", e.target.value)}
                                    />
                                  </div>
                                  <Select
                                    value={lesson.type}
                                    onValueChange={(value) => updateLesson(moduleIndex, lessonIndex, "type", value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">Video</SelectItem>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="quiz">Quiz</SelectItem>
                                      <SelectItem value="assignment">Assignment</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Course Resources</h3>
                      <p className="text-sm text-muted-foreground">Add downloadable materials and external links</p>
                    </div>
                    <Button type="button" onClick={addResource}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Resource
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {resources.map((resource, index) => (
                      <div key={index} className="flex items-center gap-4 rounded-md border p-4">
                        <div className="flex-1 grid gap-4 md:grid-cols-3">
                          <div>
                            <FormLabel>Title</FormLabel>
                            <Input
                              placeholder="e.g., Course Workbook"
                              value={resource.title}
                              onChange={(e) => updateResource(index, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <FormLabel>Type</FormLabel>
                            <Select
                              value={resource.type}
                              onValueChange={(value) => updateResource(index, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF Document</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="link">External Link</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <FormLabel>URL or Upload</FormLabel>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter URL or upload file"
                                value={resource.url}
                                onChange={(e) => updateResource(index, "url", e.target.value)}
                              />
                              <Button type="button" variant="outline" size="icon">
                                {resource.type === "link" ? (
                                  <LinkIcon className="h-4 w-4" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeResource(index)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}

                    {resources.length === 0 && (
                      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
                        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                        <h4 className="text-sm font-medium">No resources added yet</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          Add PDFs, videos, or links to enhance your course
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={addResource}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Resource
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Course Settings</h3>
                      <Separator className="mb-4" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Free Course</FormLabel>
                              <FormDescription>Make this course available for free</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem className="flex flex-col justify-between rounded-md border p-4">
                            <div className="space-y-0.5 mb-2">
                              <FormLabel className="text-base">Course Price</FormLabel>
                              <FormDescription>Set the price if this is a paid course</FormDescription>
                            </div>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} disabled={form.watch("isFree")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="isPublished"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Publish Course</FormLabel>
                              <FormDescription>Make this course visible to students</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Featured Course</FormLabel>
                              <FormDescription>Highlight this course on the homepage</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Preview Video</h3>
                      <Separator className="mb-4" />

                      <div className="flex flex-col gap-4">
                        <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                          <div className="flex h-full w-full items-center justify-center">
                            <Video className="h-10 w-10 text-muted-foreground" />
                          </div>
                        </div>
                        <Button type="button" variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Preview Video
                        </Button>
                        <FormDescription>
                          Add a short preview video to showcase your course (max 2 minutes)
                        </FormDescription>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit">{isEditing ? "Update Course" : "Create Course"}</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
