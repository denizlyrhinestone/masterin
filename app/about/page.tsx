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
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">EduAI</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              We're on a mission to transform education through the power of artificial intelligence and make quality
              learning accessible to everyone.
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
                Founded in 2020, EduAI began with a simple vision: to make high-quality education accessible to everyone
                through AI technology. What started as a small team of educators and AI enthusiasts has grown into a
                platform serving students and teachers worldwide.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our team combines expertise in education, cognitive science, and artificial intelligence to create
                learning experiences that are not only effective but also engaging and personalized to each student's
                needs.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Today, we're proud to be at the forefront of educational innovation, helping students of all ages and
                backgrounds achieve their learning goals and helping educators enhance their teaching impact.
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
                title: "Accessibility",
                description:
                  "We believe quality education should be accessible to everyone, regardless of location or background.",
              },
              {
                title: "Personalization",
                description: "We create learning experiences tailored to individual needs, styles, and goals.",
              },
              {
                title: "Innovation",
                description: "We constantly push the boundaries of what's possible with AI in education.",
              },
              {
                title: "Empowerment",
                description: "We empower both students and educators to achieve their full potential.",
              },
              {
                title: "Impact",
                description: "We measure our success by the positive impact we create on learning outcomes.",
              },
              {
                title: "Integrity",
                description: "We operate with transparency, honesty, and ethical responsibility in all we do.",
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
              Meet the experts leading our mission to transform education through AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Dr. Alex Johnson",
                role: "CEO & Co-Founder",
                image: "/placeholder.svg?height=300&width=300&query=professional educator man",
              },
              {
                name: "Dr. Sarah Chen",
                role: "Chief Learning Officer",
                image: "/placeholder.svg?height=300&width=300&query=professional woman educator",
              },
              {
                name: "Michael Rodriguez",
                role: "Chief AI Officer",
                image: "/placeholder.svg?height=300&width=300&query=professional man scientist",
              },
              {
                name: "Jessica Williams",
                role: "Chief Product Officer",
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
              We're looking for passionate educators, AI specialists, and technologists who want to transform education.
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
