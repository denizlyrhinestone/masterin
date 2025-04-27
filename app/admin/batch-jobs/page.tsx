"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, RefreshCw, CheckCircle2, XCircle, Clock, Trash2, RotateCcw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { batchProcessingService, type BatchProcessingJob } from "@/components/batch-processing-service"

export default function BatchJobsPage() {
  const [jobs, setJobs] = useState<BatchProcessingJob[]>([])
  const [selectedJob, setSelectedJob] = useState<BatchProcessingJob | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { toast } = useToast()

  // Load jobs on mount and when refreshTrigger changes
  useEffect(() => {
    const loadedJobs = batchProcessingService.getAllJobs()
    setJobs(loadedJobs)

    // Auto-refresh active jobs every 2 seconds
    const interval = setInterval(() => {
      const updatedJobs = batchProcessingService.getAllJobs()
      setJobs(updatedJobs)

      // Update selected job if it exists
      if (selectedJob) {
        const updatedSelectedJob = updatedJobs.find((job) => job.id === selectedJob.id)
        if (updatedSelectedJob) {
          setSelectedJob(updatedSelectedJob)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [refreshTrigger, selectedJob])

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Format duration
  const formatDuration = (startTime?: Date, endTime?: Date) => {
    if (!startTime) return "N/A"
    const end = endTime || new Date()
    const durationMs = end.getTime() - startTime.getTime()

    const seconds = Math.floor(durationMs / 1000)
    if (seconds < 60) return `${seconds}s`

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Get status badge
  const getStatusBadge = (status: BatchProcessingJob["status"]) => {
    switch (status) {
      case "queued":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Queued
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Processing
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Paused
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Handle job actions
  const handleJobAction = (action: "start" | "pause" | "resume" | "cancel", jobId: string) => {
    try {
      switch (action) {
        case "start":
          batchProcessingService.startJob(jobId)
          toast({
            title: "Job started",
            description: `Job ${jobId} has been started`,
          })
          break
        case "pause":
          batchProcessingService.pauseJob(jobId)
          toast({
            title: "Job paused",
            description: `Job ${jobId} has been paused`,
          })
          break
        case "resume":
          batchProcessingService.resumeJob(jobId)
          toast({
            title: "Job resumed",
            description: `Job ${jobId} has been resumed`,
          })
          break
        case "cancel":
          batchProcessingService.cancelJob(jobId)
          toast({
            title: "Job cancelled",
            description: `Job ${jobId} has been cancelled`,
          })
          break
      }

      // Refresh jobs
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Batch Processing Jobs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor thumbnail generation jobs</p>
        </div>
        <Button variant="outline" onClick={() => setRefreshTrigger((prev) => prev + 1)} className="flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Queue</CardTitle>
              <CardDescription>All thumbnail generation jobs</CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow
                        key={job.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedJob(job)}
                      >
                        <TableCell className="font-medium">{job.id.substring(0, 8)}...</TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-xs">{job.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(job.startTime)}</TableCell>
                        <TableCell>{formatDuration(job.startTime, job.endTime)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {job.status === "queued" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleJobAction("start", job.id)
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {job.status === "processing" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleJobAction("pause", job.id)
                                }}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {job.status === "paused" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleJobAction("resume", job.id)
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {(job.status === "processing" || job.status === "paused" || job.status === "queued") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleJobAction("cancel", job.id)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No jobs found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Start a new batch processing job from the batch thumbnail generator
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
                    <a href="/admin/batch-thumbnails">Create New Job</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                {selectedJob ? `Job ${selectedJob.id.substring(0, 8)}... details` : "Select a job to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedJob ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Status</p>
                      <div>{getStatusBadge(selectedJob.status)}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Progress</p>
                      <p className="font-medium">{selectedJob.progress}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Courses</p>
                      <p className="font-medium">{selectedJob.courseIds.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Processed</p>
                      <p className="font-medium">
                        {selectedJob.currentIndex} / {selectedJob.courseIds.length}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Started</p>
                      <p className="font-medium">{formatDate(selectedJob.startTime)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">{formatDuration(selectedJob.startTime, selectedJob.endTime)}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Tabs defaultValue="results">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="results">Results</TabsTrigger>
                        <TabsTrigger value="options">Options</TabsTrigger>
                      </TabsList>

                      <TabsContent value="results" className="pt-4">
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-3">
                            {selectedJob.results.map((result) => (
                              <div key={result.courseId} className="border rounded-md overflow-hidden">
                                <div
                                  className={`px-3 py-2 text-xs font-medium ${
                                    result.status === "completed"
                                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                      : result.status === "failed"
                                        ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                        : result.status === "processing"
                                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                          : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    {result.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-2" />}
                                    {result.status === "failed" && <XCircle className="h-3 w-3 mr-2" />}
                                    {result.status === "processing" && (
                                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                                    )}
                                    {result.status === "pending" && <Clock className="h-3 w-3 mr-2" />}
                                    {result.courseTitle}
                                  </div>
                                </div>

                                <div className="p-3">
                                  {result.status === "completed" && result.thumbnails.length > 0 ? (
                                    <div className="text-xs text-gray-500">
                                      Generated {result.thumbnails.length} thumbnails
                                    </div>
                                  ) : result.status === "failed" ? (
                                    <div className="text-xs text-red-600 dark:text-red-400">
                                      {result.error || "Failed to generate thumbnails"}
                                    </div>
                                  ) : result.status === "processing" ? (
                                    <div className="text-xs text-blue-600 dark:text-blue-400">Processing...</div>
                                  ) : (
                                    <div className="text-xs text-gray-500">Waiting to be processed</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="options" className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Auto-apply thumbnails</span>
                            <span>{selectedJob.options.autoApply ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Skip existing thumbnails</span>
                            <span>{selectedJob.options.skipExistingThumbnails ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Process in background</span>
                            <span>{selectedJob.options.processInBackground ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Email notification</span>
                            <span>{selectedJob.options.sendEmailNotification ? "Yes" : "No"}</span>
                          </div>
                          {selectedJob.options.sendEmailNotification && selectedJob.options.emailAddress && (
                            <div className="flex justify-between text-sm">
                              <span>Email address</span>
                              <span>{selectedJob.options.emailAddress}</span>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No job selected</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Select a job from the table to view details
                  </p>
                </div>
              )}
            </CardContent>
            {selectedJob && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>

                {selectedJob.status === "queued" && (
                  <Button onClick={() => handleJobAction("start", selectedJob.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Job
                  </Button>
                )}
                {selectedJob.status === "processing" && (
                  <Button onClick={() => handleJobAction("pause", selectedJob.id)}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Job
                  </Button>
                )}
                {selectedJob.status === "paused" && (
                  <Button onClick={() => handleJobAction("resume", selectedJob.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Resume Job
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
