"use client"

import { useState } from "react"
import { CheckCircle, Clock, Award, Calendar, Users, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface CourseEnrollmentProps {
  id: string
  title: string
  price: number
  duration: string
  level: string
  enrolledCount: number
  lastUpdated: string
  certificateIncluded?: boolean
  isPurchased?: boolean
}

export function CourseEnrollment({
  id,
  title,
  price,
  duration,
  level,
  enrolledCount,
  lastUpdated,
  certificateIncluded = true,
  isPurchased = false,
}: CourseEnrollmentProps) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { toast } = useToast()

  const handleEnroll = () => {
    setIsEnrolling(true)

    // Simulate API call
    setTimeout(() => {
      setIsEnrolling(false)
      toast({
        title: "Enrolled Successfully!",
        description: `You have been enrolled in "${title}". You can now access all course materials.`,
      })
    }, 1500)
  }

  const handleAddToCart = () => {
    setIsAddingToCart(true)

    // Simulate API call
    setTimeout(() => {
      setIsAddingToCart(false)
      toast({
        title: "Added to Cart",
        description: `"${title}" has been added to your cart.`,
      })
    }, 1000)
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="text-3xl font-bold">${price.toFixed(2)}</div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>{level}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>{enrolledCount.toLocaleString()} students enrolled</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>Last updated {formatDate(lastUpdated)}</span>
          </div>
          {certificateIncluded && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-3" />
              <span>Certificate of completion</span>
            </div>
          )}
        </div>

        {isPurchased ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">You own this course</h4>
                <p className="text-sm text-green-700">You can access all course materials and updates.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">30-Day Money-Back Guarantee</h4>
                <p className="text-sm text-amber-700">Full refund if you're not satisfied with the course.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0 flex flex-col gap-3">
        {isPurchased ? (
          <Button className="w-full" size="lg">
            Continue Learning
          </Button>
        ) : (
          <>
            <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isEnrolling || isAddingToCart}>
              {isEnrolling ? "Enrolling..." : "Enroll Now"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
              disabled={isEnrolling || isAddingToCart}
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </>
        )}

        <p className="text-xs text-center text-muted-foreground mt-2">
          By enrolling, you agree to our Terms of Use and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  )
}
