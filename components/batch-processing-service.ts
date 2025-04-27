/**
 * Service for handling batch thumbnail generation
 */

// Types
export interface BatchProcessingOptions {
  autoApply: boolean
  skipExistingThumbnails: boolean
  processInBackground: boolean
  sendEmailNotification: boolean
  emailAddress?: string
  timestampsPerVideo: number[]
}

export interface BatchProcessingJob {
  id: string
  courseIds: string[]
  options: BatchProcessingOptions
  status: "queued" | "processing" | "paused" | "completed" | "failed"
  progress: number
  currentIndex: number
  results: BatchProcessingResult[]
  startTime?: Date
  endTime?: Date
  error?: string
}

export interface BatchProcessingResult {
  courseId: string
  courseTitle: string
  status: "pending" | "processing" | "completed" | "failed"
  thumbnails: string[]
  selectedThumbnail: string | null
  error?: string
  processingTime?: number
}

// Mock implementation for the v0 preview
export class BatchProcessingService {
  private static instance: BatchProcessingService
  private jobs: Map<string, BatchProcessingJob> = new Map()

  private constructor() {}

  public static getInstance(): BatchProcessingService {
    if (!BatchProcessingService.instance) {
      BatchProcessingService.instance = new BatchProcessingService()
    }
    return BatchProcessingService.instance
  }

  /**
   * Create a new batch processing job
   */
  public createJob(courseIds: string[], options: BatchProcessingOptions): string {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const job: BatchProcessingJob = {
      id: jobId,
      courseIds,
      options,
      status: "queued",
      progress: 0,
      currentIndex: 0,
      results: courseIds.map((courseId) => ({
        courseId,
        courseTitle: `Course ${courseId}`, // In a real app, we'd fetch the title
        status: "pending",
        thumbnails: [],
        selectedThumbnail: null,
      })),
    }

    this.jobs.set(jobId, job)
    return jobId
  }

  /**
   * Start processing a job
   */
  public startJob(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    job.status = "processing"
    job.startTime = new Date()
    this.jobs.set(jobId, job)

    // In a real app, this would start a background process
    // For the v0 preview, we'll simulate processing
    this.simulateProcessing(jobId)
  }

  /**
   * Pause a running job
   */
  public pauseJob(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (job.status === "processing") {
      job.status = "paused"
      this.jobs.set(jobId, job)
    }
  }

  /**
   * Resume a paused job
   */
  public resumeJob(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (job.status === "paused") {
      job.status = "processing"
      this.jobs.set(jobId, job)
      this.simulateProcessing(jobId)
    }
  }

  /**
   * Cancel a job
   */
  public cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    job.status = "failed"
    job.error = "Job cancelled by user"
    job.endTime = new Date()
    this.jobs.set(jobId, job)
  }

  /**
   * Get job status
   */
  public getJob(jobId: string): BatchProcessingJob | undefined {
    return this.jobs.get(jobId)
  }

  /**
   * Get all jobs
   */
  public getAllJobs(): BatchProcessingJob[] {
    return Array.from(this.jobs.values())
  }

  /**
   * Simulate processing for the v0 preview
   */
  private simulateProcessing(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (!job || job.status !== "processing") {
      return
    }

    // If all courses are processed, mark job as completed
    if (job.currentIndex >= job.courseIds.length) {
      job.status = "completed"
      job.progress = 100
      job.endTime = new Date()
      this.jobs.set(jobId, job)

      // Send email notification if enabled
      if (job.options.sendEmailNotification && job.options.emailAddress) {
        console.log(`Sending email notification to ${job.options.emailAddress}`)
      }

      return
    }

    // Process the current course
    const courseId = job.courseIds[job.currentIndex]
    const resultIndex = job.results.findIndex((r) => r.courseId === courseId)

    if (resultIndex !== -1) {
      // Update status to processing
      job.results[resultIndex].status = "processing"
      this.jobs.set(jobId, job)

      // Simulate processing time (1-5 seconds)
      const processingTime = Math.floor(Math.random() * 4000) + 1000

      setTimeout(() => {
        // Check if job is still processing (not paused or cancelled)
        const updatedJob = this.jobs.get(jobId)
        if (!updatedJob || updatedJob.status !== "processing") {
          return
        }

        // 90% chance of success
        const success = Math.random() < 0.9

        if (success) {
          // Generate mock thumbnails
          const mockThumbnails = [
            `/placeholder.svg?height=720&width=1280&query=Course ${courseId} thumbnail 1`,
            `/placeholder.svg?height=720&width=1280&query=Course ${courseId} thumbnail 2`,
            `/placeholder.svg?height=720&width=1280&query=Course ${courseId} thumbnail 3`,
            `/placeholder.svg?height=720&width=1280&query=Course ${courseId} thumbnail 4`,
          ]

          updatedJob.results[resultIndex] = {
            ...updatedJob.results[resultIndex],
            status: "completed",
            thumbnails: mockThumbnails,
            selectedThumbnail: mockThumbnails[Math.floor(Math.random() * mockThumbnails.length)],
            processingTime,
          }
        } else {
          // Simulate failure
          updatedJob.results[resultIndex] = {
            ...updatedJob.results[resultIndex],
            status: "failed",
            error: "Failed to process video",
            processingTime,
          }
        }

        // Update progress
        updatedJob.currentIndex++
        updatedJob.progress = Math.round((updatedJob.currentIndex / updatedJob.courseIds.length) * 100)
        this.jobs.set(jobId, updatedJob)

        // Process next course
        this.simulateProcessing(jobId)
      }, processingTime)
    } else {
      // Skip to next course if result not found
      job.currentIndex++
      this.jobs.set(jobId, job)
      this.simulateProcessing(jobId)
    }
  }
}

// Export singleton instance
export const batchProcessingService = BatchProcessingService.getInstance()
