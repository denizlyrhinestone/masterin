import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"

export default function ComingSoonPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Coming Soon</CardTitle>
          <CardDescription>
            We're working hard to bring you this feature. It will be available in the near future.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Thank you for your patience as we continue to improve and expand our platform. This feature is currently
            under development and will be released soon.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
