import type { VideoMetadata } from "@/lib/youtube-utils"
import type { TranscriptItem } from "@/lib/youtube-utils"
import type { VideoCompanion } from "@/types/video-companion"

// Simple template-based question generator
const generateTemplateQuestions = (metadata: VideoMetadata) => {
  const title = metadata.title || ""
  const description = metadata.description || ""

  // Generate basic questions based on video metadata
  const questions = [
    {
      id: "q1",
      text: `What are the main topics covered in "${title}"?`,
      type: "open-ended",
      timestamp: 0,
    },
    {
      id: "q2",
      text: "What did you find most interesting about this video?",
      type: "open-ended",
      timestamp: Math.floor(metadata.duration / 3),
    },
    {
      id: "q3",
      text: "How would you summarize the key points of this video?",
      type: "open-ended",
      timestamp: Math.floor(metadata.duration / 2),
    },
    {
      id: "q4",
      text: "What questions do you still have after watching this video?",
      type: "open-ended",
      timestamp: Math.floor(metadata.duration * 0.8),
    },
    {
      id: "q5",
      text: "How could you apply what you learned from this video?",
      type: "open-ended",
      timestamp: metadata.duration - 10,
    },
  ]

  return questions
}

// Generate notes based on video metadata
const generateNotes = (metadata: VideoMetadata, transcript: TranscriptItem[] | null) => {
  const notes = []

  // Add title and description
  notes.push({
    id: "note-1",
    text: `# ${metadata.title}`,
    timestamp: 0,
  })

  if (metadata.description) {
    notes.push({
      id: "note-2",
      text: metadata.description,
      timestamp: 0,
    })
  }

  // Add transcript-based notes if available
  if (transcript && transcript.length > 0) {
    // Sample a few transcript items for notes
    const sampleSize = Math.min(5, transcript.length)
    const step = Math.floor(transcript.length / sampleSize)

    for (let i = 0; i < sampleSize; i++) {
      const item = transcript[i * step]
      notes.push({
        id: `note-transcript-${i}`,
        text: `**${Math.floor(item.start / 60)}:${Math.floor(item.start % 60)
          .toString()
          .padStart(2, "0")}** - ${item.text}`,
        timestamp: item.start,
      })
    }
  }

  return notes
}

// Main function to generate enhanced companion
export async function generateEnhancedCompanion(
  metadata: VideoMetadata,
  transcript: TranscriptItem[] | null,
): Promise<VideoCompanion> {
  try {
    // Generate template-based questions
    const questions = generateTemplateQuestions(metadata)

    // Generate notes
    const notes = generateNotes(metadata, transcript)

    // Create the companion object
    const companion: VideoCompanion = {
      videoId: metadata.videoId,
      title: metadata.title,
      questions,
      notes,
      summary: metadata.description || "No summary available.",
      keyPoints: ["Watch the video to discover key points"],
      usedAI: false,
      timestamp: new Date().toISOString(),
    }

    return companion
  } catch (error) {
    console.error("Error generating companion:", error)

    // Return a minimal companion with error information
    return {
      videoId: metadata.videoId,
      title: metadata.title,
      questions: [],
      notes: [],
      summary: "Error generating companion.",
      keyPoints: ["An error occurred while generating the companion."],
      usedAI: false,
      timestamp: new Date().toISOString(),
    }
  }
}
