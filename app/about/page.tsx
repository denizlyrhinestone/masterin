import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Masterin
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              We're on a mission to transform businesses through the power of artificial intelligence and innovative
              technology solutions.
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&query=diverse team in modern office"
                  alt="Our Team"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Founded in 2018, Masterin began with a simple vision: to make advanced AI technology accessible to
                businesses of all sizes. What started as a small team of passionate AI enthusiasts has grown into a
                global company serving clients across industries.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our team combines deep technical expertise with business acumen to deliver solutions that not only
                leverage cutting-edge technology but also address real business challenges and drive measurable results.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Today, we're proud to be at the forefront of the AI revolution, helping businesses transform their
                operations, enhance customer experiences, and unlock new opportunities for growth and innovation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Values</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              These core principles guide everything we do at Masterin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                description: "We constantly push the boundaries of what's possible with AI and technology.",
              },
              {
                title: "Excellence",
                description: "We are committed to delivering the highest quality solutions and experiences.",
              },
              {
                title: "Integrity",
                description: "We operate with transparency, honesty, and ethical responsibility.",
              },
              {
                title: "Collaboration",
                description: "We believe in the power of teamwork and partnership with our clients.",
              },
              {
                title: "Impact",
                description: "We measure our success by the positive impact we create for our clients.",
              },
              {
                title: "Inclusivity",
                description: "We embrace diversity and create solutions that work for everyone.",
              },
            ].map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Leadership Team</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Meet the experts leading our mission to transform businesses through AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Alex Johnson",
                role: "CEO & Founder",
                image: "/placeholder.svg?height=300&width=300&query=professional man CEO",
              },
              {
                name: "Sarah Chen",
                role: "CTO",
                image: "/placeholder.svg?height=300&width=300&query=professional woman tech leader",
              },
              {
                name: "Michael Rodriguez",
                role: "Chief AI Officer",
                image: "/placeholder.svg?height=300&width=300&query=professional man scientist",
              },
              {
                name: "Jessica Williams",
                role: "COO",
                image: "/placeholder.svg?height=300&width=300&query=professional woman executive",
              },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Team</h2>
            <p className="text-xl mb-8 text-purple-100">
              We're always looking for talented individuals who are passionate about AI and technology.
            </p>
            <Button size="lg" variant="secondary" className="px-8">
              View Open Positions
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
