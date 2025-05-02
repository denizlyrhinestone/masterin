import { Globe, Twitter, Linkedin, Github, Users, BookOpen, Star } from "lucide-react"
import type { InstructorDetails } from "@/types/course"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface InstructorProfileProps {
  instructor: InstructorDetails
}

export function InstructorProfile({ instructor }: InstructorProfileProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Instructor</h3>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <Avatar className="h-16 w-16">
          <AvatarImage src={instructor.avatar || "/placeholder.svg"} alt={instructor.name} />
          <AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>
        </Avatar>

        <div className="space-y-2 flex-1">
          <div>
            <h4 className="text-lg font-medium">{instructor.name}</h4>
            <p className="text-sm text-muted-foreground">{instructor.title}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm">{instructor.rating.toFixed(1)} Instructor Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{instructor.studentsCount.toLocaleString()} Students</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{instructor.coursesCount} Courses</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <p className="text-sm">{instructor.bio}</p>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {instructor.website && (
          <Button variant="outline" size="sm" asChild>
            <a href={instructor.website} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-1" />
              Website
            </a>
          </Button>
        )}

        {instructor.social?.twitter && (
          <Button variant="outline" size="sm" asChild>
            <a href={instructor.social.twitter} target="_blank" rel="noopener noreferrer">
              <Twitter className="h-4 w-4 mr-1" />
              Twitter
            </a>
          </Button>
        )}

        {instructor.social?.linkedin && (
          <Button variant="outline" size="sm" asChild>
            <a href={instructor.social.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-4 w-4 mr-1" />
              LinkedIn
            </a>
          </Button>
        )}

        {instructor.social?.github && (
          <Button variant="outline" size="sm" asChild>
            <a href={instructor.social.github} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-1" />
              GitHub
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
