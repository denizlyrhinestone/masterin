import { type NextRequest, NextResponse } from "next/server"
import { verifyQStashSignature } from "@/lib/qstash-verify"
import { addNotification } from "@/lib/notifications"
import { getRecommendedCourses } from "@/lib/recommendations"

// This would typically come from a database
const coursesData = {
  "web-development": {
    id: "web-development",
    title: "Full-Stack Web Development",
  },
  "machine-learning": {
    id: "machine-learning",
    title: "Machine Learning Fundamentals",
  },
  "ui-design": {
    id: "ui-design",
    title: "UI/UX Design Principles",
  },
  "python-programming": {
    id: "python-programming",
    title: "Python for Data Analysis",
  },
  "javascript-basics": {
    id: "javascript-basics",
    title: "JavaScript Fundamentals",
  },
  "data-visualization": {
    id: "data-visualization",
    title: "Data Visualization with D3.js",
  },
}

export async function POST(request: NextRequest) {
  try {
    // Verify that this request is coming from QStash
    const { isValid, body } = await verifyQStashSignature(request)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Extract data from the verified message
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // Get course recommendations for the user
    const recommendedCourseIds = await getRecommendedCourses(userId, 3)

    // Format the recommendations
    const recommendations = recommendedCourseIds
      .map((id) => coursesData[id as keyof typeof coursesData])
      .filter(Boolean)

    if (recommendations.length > 0) {
      // Create a formatted message with the recommendations
      const courseTitles = recommendations.map((course) => `"${course.title}"`).join(", ")

      // Add a notification for the user
      await addNotification(
        userId,
        "announcement",
        "Your Weekly Course Recommendations",
        `Based on your interests, we recommend: ${courseTitles}`,
        "/dashboard",
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing weekly digest:", error)
    return NextResponse.json({ error: "Failed to process weekly digest" }, { status: 500 })
  }
}
