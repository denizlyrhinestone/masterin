import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Brain, Code, LineChart, Users, Shield, Zap } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Our{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Comprehensive solutions designed to help your business leverage the power of AI and technology.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-10 h-10 text-purple-600" />,
                title: "AI Solutions",
                description:
                  "Harness the power of artificial intelligence to transform your business operations and customer experiences.",
                link: "/ai",
              },
              {
                icon: <Code className="w-10 h-10 text-purple-600" />,
                title: "Custom Development",
                description:
                  "Tailored software solutions designed to address your unique business challenges and requirements.",
                link: "/services/development",
              },
              {
                icon: <LineChart className="w-10 h-10 text-purple-600" />,
                title: "Data Analytics",
                description:
                  "Turn your data into actionable insights with our advanced analytics and visualization tools.",
                link: "/services/analytics",
              },
              {
                icon: <Users className="w-10 h-10 text-purple-600" />,
                title: "Consulting",
                description:
                  "Strategic guidance from our experts to help you navigate the complex world of technology and AI.",
                link: "/services/consulting",
              },
              {
                icon: <Shield className="w-10 h-10 text-purple-600" />,
                title: "Cybersecurity",
                description: "Protect your business and customer data with our comprehensive security solutions.",
                link: "/services/security",
              },
              {
                icon: <Zap className="w-10 h-10 text-purple-600" />,
                title: "Cloud Services",
                description:
                  "Scalable, reliable cloud infrastructure and services to power your business applications.",
                link: "/services/cloud",
              },
            ].map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                  <Link href={service.link}>
                    <Button variant="ghost" className="p-0 h-auto group">
                      Learn More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Approach</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We follow a proven methodology to ensure successful outcomes for every project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                title: "Discovery",
                description:
                  "We start by understanding your business, challenges, and objectives to define the scope of work.",
              },
              {
                number: "02",
                title: "Strategy",
                description:
                  "We develop a comprehensive strategy and roadmap tailored to your specific needs and goals.",
              },
              {
                number: "03",
                title: "Implementation",
                description:
                  "Our expert team executes the plan with precision, keeping you informed every step of the way.",
              },
              {
                number: "04",
                title: "Optimization",
                description: "We continuously monitor, measure, and refine to ensure optimal performance and results.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xl mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Don't just take our word for it. Here's what our clients have to say about our services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Working with Masterin has been a game-changer for our business. Their AI solutions have helped us streamline operations and better serve our customers.",
                author: "John Smith",
                role: "CEO, TechCorp",
                image: "/placeholder.svg?height=80&width=80&query=professional man CEO",
              },
              {
                quote:
                  "The team at Masterin truly understands our business needs. Their custom development work has been exceptional, delivering exactly what we needed.",
                author: "Emily Chen",
                role: "CTO, InnovateCo",
                image: "/placeholder.svg?height=80&width=80&query=professional woman tech",
              },
              {
                quote:
                  "Their data analytics services have given us insights we never thought possible. We're now making more informed decisions based on real data.",
                author: "Michael Johnson",
                role: "Director of Operations, GlobalRetail",
                image: "/placeholder.svg?height=80&width=80&query=professional man business",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.author}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.author}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Contact us today to discuss how our services can help your business grow and thrive.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary" className="px-8">
                Contact Us
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white hover:text-purple-600"
              >
                View Services
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
