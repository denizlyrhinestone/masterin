import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Student",
      image: "/testimonial-student-1.png",
      content:
        "Masterin has completely transformed my learning experience. The AI tools have helped me understand complex concepts that I struggled with before.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Professional",
      image: "/testimonial-student-2.png",
      content:
        "As someone working full-time, I appreciate the flexibility Masterin offers. The courses are well-structured and the AI assistant is incredibly helpful.",
      rating: 5,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Teacher",
      image: "/testimonial-student-3.png",
      content:
        "I've recommended Masterin to all my students. The platform provides excellent resources and the AI tools complement traditional learning methods perfectly.",
      rating: 4,
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hear from students and professionals who have transformed their learning experience with Masterin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
