import Image from "next/image"

const testimonials = [
  {
    quote:
      "Masterin has completely transformed how I approach learning. The AI tutor is like having a personal teacher available 24/7.",
    author: "Sarah Johnson",
    role: "High School Student",
    avatarUrl: "/placeholder.svg?height=48&width=48&query=portrait of female high school student smiling",
  },
  {
    quote:
      "As an educator, I've found Masterin to be an invaluable tool for extending my classroom beyond physical boundaries.",
    author: "Dr. Michael Chen",
    role: "University Professor",
    avatarUrl: "/placeholder.svg?height=48&width=48&query=portrait of male university professor with glasses",
  },
  {
    quote:
      "The progress tracking features have helped me identify areas where my students need additional support. It's revolutionized my teaching.",
    author: "Emma Rodriguez",
    role: "Middle School Teacher",
    avatarUrl: "/placeholder.svg?height=48&width=48&query=portrait of female middle school teacher smiling",
  },
]

export function TestimonialSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Our Users Say</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Hear from students and educators who have experienced the Masterin difference.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 text-gray-600">
                <svg className="h-8 w-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="mb-6 text-gray-700">{testimonial.quote}</p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.avatarUrl || "/placeholder.svg"}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
