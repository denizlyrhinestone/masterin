"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export function EnrollmentSection() {
  const [isEnrolled, setIsEnrolled] = useState(false)

  const handleEnroll = () => {
    setIsEnrolled(true)
  }

  return (
    <Card>
      <CardContent className="p-6">
        {isEnrolled ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">You're Enrolled!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You now have access to all course materials.</p>
            <Link href="/courses/course-detail/lesson">
              <Button className="w-full">Start Learning</Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-lg font-bold">Price</span>
                <span className="text-lg font-bold">$49.99</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">One-time payment, lifetime access</div>
            </div>
            <Button className="w-full mb-4" onClick={handleEnroll}>
              Enroll Now
            </Button>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">30-day money-back guarantee</div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Full lifetime access</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Access on mobile and desktop</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Certificate of completion</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
