import { redirect } from "next/navigation"

export default function CoursesPage() {
  // Redirect to the services page which contains the courses content
  redirect("/services")
}
