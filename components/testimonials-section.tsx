"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "High School Student",
    content:
      "Masterin has completely transformed how I study. The AI tools help me understand complex topics in a way that makes sense to me.",
    avatar: "/testimonial-student-1.png",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "College Freshman",
    content:
      "The math assistant helped me ace my calculus class. It doesn't just give answers, it explains concepts in a way I can understand.",
    avatar: "/testimonial-student-2.png",
  },
  {
    id: 3,
    name: "Jessica Williams",
    role: "Graduate Student",
    content:
      "As a non-native English speaker, the language tutor has been invaluable for improving my academic writing and communication skills.",
    avatar: "/testimonial-student-3.png",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>

        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/1 lg:basis-1/1">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-4 relative">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-lg mb-4 italic">{testimonial.content}</p>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2" />
          <CarouselNext className="right-0 translate-x-1/2" />
        </Carousel>
      </div>
    </section>
  )
}
