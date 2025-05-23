import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Services - Masterin",
  description: "Explore our professional services",
}

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      title: "Custom AI Solutions",
      description: "Tailored AI solutions for your specific educational needs",
      features: [
        "Personalized AI tutoring systems",
        "Custom learning path generation",
        "Automated assessment tools",
        "Content recommendation engines",
      ],
      price: "Custom pricing",
    },
    {
      id: 2,
      title: "Educational Consulting",
      description: "Expert guidance for educational institutions and organizations",
      features: [
        "AI integration strategy",
        "Curriculum development",
        "Teacher training programs",
        "Learning analytics implementation",
      ],
      price: "Starting at $2,000",
    },
    {
      id: 3,
      title: "Enterprise Solutions",
      description: "Comprehensive AI learning platforms for large organizations",
      features: [
        "Scalable learning management",
        "Advanced analytics dashboard",
        "Custom branding and integration",
        "Dedicated support team",
      ],
      price: "Starting at $5,000",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional services to help organizations leverage AI for education and training.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <p className="font-bold text-lg mb-4">{service.price}</p>
                  <Button className="w-full">Request Consultation</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
