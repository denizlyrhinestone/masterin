"use client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, Award, CheckCircle } from "lucide-react"

interface EnrollmentSectionProps {
  price?: number
  isFree?: boolean
  discount?: {
    originalPrice: number
    discountPercentage: number
    endsAt?: string
  }
  duration: string
  enrollmentCount: number
  certificateIncluded: boolean
  isEnrolled?: boolean
  onEnroll?: () => void
  features?: string[]
}

export default function EnrollmentSection({
  price,
  isFree = false,
  discount,
  duration,
  enrollmentCount,
  certificateIncluded,
  isEnrolled = false,
  onEnroll,
  features = [],
}: EnrollmentSectionProps) {
  return (
    <Card className="sticky top-6">
      <CardContent className="pt-6">
        <div className="mb-4">
          {isFree ? (
            <div className="text-2xl font-bold">Free</div>
          ) : (
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold">${price?.toFixed(2)}</div>
              {discount && (
                <>
                  <div className="text-lg text-muted-foreground line-through">${discount.originalPrice.toFixed(2)}</div>
                  <div className="text-sm text-green-600 font-medium">{discount.discountPercentage}% off</div>
                </>
              )}
            </div>
          )}
          {discount?.endsAt && <div className="text-sm text-red-500 mt-1">Offer ends in {discount.endsAt}</div>}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <span>{enrollmentCount} students enrolled</span>
          </div>
          {certificateIncluded && (
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-primary" />
              <span>Certificate of completion</span>
            </div>
          )}
        </div>

        {features.length > 0 && (
          <div className="space-y-2 mb-6">
            <h3 className="font-medium">This course includes:</h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isEnrolled ? (
          <Button className="w-full" variant="secondary">
            Continue Learning
          </Button>
        ) : (
          <Button className="w-full" onClick={onEnroll}>
            {isFree ? "Enroll Now" : "Buy Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
