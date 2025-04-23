import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Brain, Zap, MessageSquare, Database, LineChart, Code } from "lucide-react"

export default function AIPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Advanced{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Solutions
                </span>{" "}
                for Modern Businesses
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Harness the power of artificial intelligence to transform your business operations, enhance customer
                experiences, and drive innovation.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="px-8">
                  Explore Solutions
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  Schedule Demo
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&query=AI visualization with neural networks purple"
                  alt="AI Visualization"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solutions Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our AI Solutions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We offer a comprehensive suite of AI-powered solutions designed to address your specific business
              challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="w-10 h-10 text-purple-600" />,
                title: "Conversational AI",
                description:
                  "Intelligent chatbots and virtual assistants that provide personalized customer support and engagement.",
                link: "/ai/conversational",
              },
              {
                icon: <Database className="w-10 h-10 text-purple-600" />,
                title: "Predictive Analytics",
                description: "Advanced data analysis and forecasting to help you make informed business decisions.",
                link: "/ai/predictive-analytics",
              },
              {
                icon: <Brain className="w-10 h-10 text-purple-600" />,
                title: "Machine Learning",
                description: "Custom machine learning models tailored to your specific business needs and objectives.",
                link: "/ai/machine-learning",
              },
              {
                icon: <LineChart className="w-10 h-10 text-purple-600" />,
                title: "Business Intelligence",
                description:
                  "Transform your data into actionable insights with our AI-powered business intelligence tools.",
                link: "/ai/business-intelligence",
              },
              {
                icon: <Code className="w-10 h-10 text-purple-600" />,
                title: "AI Development",
                description: "Custom AI development services to build innovative solutions for your unique challenges.",
                link: "/ai/development",
              },
              {
                icon: <Zap className="w-10 h-10 text-purple-600" />,
                title: "Process Automation",
                description: "Streamline operations and reduce costs with intelligent process automation.",
                link: "/ai/automation",
              },
            ].map((solution, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{solution.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{solution.description}</p>
                  <Link href={solution.link}>
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

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How Our AI Solutions Work</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Our approach combines cutting-edge technology with deep industry expertise to deliver results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-12">
                {[
                  {
                    number: "01",
                    title: "Data Collection & Analysis",
                    description:
                      "We gather and analyze your data to understand your unique business challenges and opportunities.",
                  },
                  {
                    number: "02",
                    title: "Custom Solution Design",
                    description:
                      "Our experts design a tailored AI solution that addresses your specific needs and objectives.",
                  },
                  {
                    number: "03",
                    title: "Implementation & Integration",
                    description:
                      "We seamlessly implement and integrate the solution into your existing systems and workflows.",
                  },
                  {
                    number: "04",
                    title: "Continuous Improvement",
                    description:
                      "Our AI solutions continuously learn and improve over time, delivering increasing value.",
                  },
                ].map((step, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mr-6">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&query=AI workflow diagram with purple nodes"
                  alt="AI Workflow"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Rapid Deployment</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get up and running quickly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Success Stories</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See how our AI solutions have helped businesses like yours achieve remarkable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: "/placeholder.svg?height=300&width=500&query=retail store with technology",
                title: "Global Retailer",
                description: "Increased sales by 35% with our AI-powered recommendation engine and customer analytics.",
                link: "/case-studies/retail",
              },
              {
                image: "/placeholder.svg?height=300&width=500&query=healthcare technology",
                title: "Healthcare Provider",
                description:
                  "Reduced operational costs by 28% while improving patient outcomes using our predictive analytics.",
                link: "/case-studies/healthcare",
              },
              {
                image: "/placeholder.svg?height=300&width=500&query=financial technology dashboard",
                title: "Financial Services",
                description: "Detected fraud patterns in real-time, preventing over $2M in potential losses.",
                link: "/case-studies/finance",
              },
            ].map((caseStudy, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={caseStudy.image || "/placeholder.svg"}
                    alt={caseStudy.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{caseStudy.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{caseStudy.description}</p>
                  <Link href={caseStudy.link}>
                    <Button variant="ghost" className="p-0 h-auto group">
                      Read Case Study{" "}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get answers to common questions about our AI solutions.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  question: "How can AI benefit my business?",
                  answer:
                    "AI can benefit your business in numerous ways, including automating repetitive tasks, providing deeper insights from your data, enhancing customer experiences, optimizing operations, and enabling more informed decision-making.",
                },
                {
                  question: "Do I need technical expertise to use your AI solutions?",
                  answer:
                    "No, our AI solutions are designed to be user-friendly and accessible to non-technical users. We provide comprehensive training and support to ensure you can effectively leverage our technology.",
                },
                {
                  question: "How long does it take to implement an AI solution?",
                  answer:
                    "Implementation timelines vary depending on the complexity of the solution and your specific requirements. Simple solutions can be deployed in a few weeks, while more complex enterprise implementations may take 2-3 months.",
                },
                {
                  question: "Is my data secure with your AI solutions?",
                  answer:
                    "Yes, data security is our top priority. We employ enterprise-grade security measures, including encryption, access controls, and regular security audits. We are also compliant with major data protection regulations.",
                },
                {
                  question: "Can your AI solutions integrate with our existing systems?",
                  answer:
                    "Yes, our AI solutions are designed to integrate seamlessly with your existing systems and workflows. We offer APIs and pre-built connectors for popular business applications and platforms.",
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business with AI?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Schedule a consultation with our AI experts to discuss your specific needs and how we can help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary" className="px-8">
                Schedule Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white hover:text-purple-600"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
