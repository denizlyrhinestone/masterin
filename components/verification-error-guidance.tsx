"use client"

import { XCircle, RefreshCw, HelpCircle, Mail, ShieldAlert, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"

interface VerificationErrorGuidanceProps {
  errorType:
    | "invalid"
    | "expired"
    | "already-verified"
    | "technical"
    | "not-found"
    | "already-used"
    | "exceeded-attempts"
  email?: string
  onResendClick?: () => void
  isResending?: boolean
}

export function VerificationErrorGuidance({
  errorType,
  email,
  onResendClick,
  isResending = false,
}: VerificationErrorGuidanceProps) {
  const errorMessages = {
    invalid: {
      title: "Invalid Verification Link",
      description: "The verification link you clicked is invalid or has been tampered with.",
      icon: <XCircle className="h-12 w-12 text-destructive" />,
      guidance: "Please request a new verification email using the button below.",
      color: "destructive",
    },
    expired: {
      title: "Verification Link Expired",
      description: "Your verification link has expired. Verification links are valid for 48 hours.",
      icon: <RefreshCw className="h-12 w-12 text-amber-500" />,
      guidance: "Please request a new verification email to continue the verification process.",
      color: "amber",
    },
    "already-verified": {
      title: "Email Already Verified",
      description: "Your email address has already been verified.",
      icon: <Mail className="h-12 w-12 text-green-500" />,
      guidance: "You can now access all features of the platform. No further action is needed.",
      color: "green",
    },
    "already-used": {
      title: "Link Already Used",
      description: "This verification link has already been used.",
      icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
      guidance: "If you still need to verify your email, please request a new verification link.",
      color: "amber",
    },
    technical: {
      title: "Technical Error",
      description: "We encountered a technical issue while verifying your email.",
      icon: <HelpCircle className="h-12 w-12 text-blue-500" />,
      guidance: "Please try again later or contact our support team if the problem persists.",
      color: "blue",
    },
    "not-found": {
      title: "User Not Found",
      description: "We couldn't find an account associated with this verification link.",
      icon: <XCircle className="h-12 w-12 text-destructive" />,
      guidance: "Please make sure you're using the correct link or sign up for a new account.",
      color: "destructive",
    },
    "exceeded-attempts": {
      title: "Verification Limit Reached",
      description: "You've exceeded the maximum number of verification attempts for security reasons.",
      icon: <ShieldAlert className="h-12 w-12 text-destructive" />,
      guidance: "Please contact our support team to verify your account.",
      color: "destructive",
    },
  }

  const error = errorMessages[errorType]
  const colorClasses = {
    destructive: "text-destructive bg-destructive/10",
    amber: "text-amber-600 bg-amber-50",
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <div className={`p-3 rounded-full ${colorClasses[error.color as keyof typeof colorClasses]}`}>
              {error.icon}
            </div>
          </motion.div>
          <CardTitle className="text-xl">{error.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>{error.description}</p>
          <div className="bg-muted p-4 rounded-md text-sm">
            <p className="font-medium">What to do next:</p>
            <p className="mt-1">{error.guidance}</p>
            {email && (
              <p className="mt-2">
                The verification email was sent to <span className="font-medium">{email}</span>
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {(errorType === "invalid" || errorType === "expired" || errorType === "already-used") && onResendClick && (
            <Button onClick={onResendClick} className="w-full" disabled={isResending}>
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
          )}

          {errorType === "already-verified" && (
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}

          {(errorType === "technical" || errorType === "exceeded-attempts") && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact-support">Contact Support</Link>
            </Button>
          )}

          {(errorType === "invalid" ||
            errorType === "not-found" ||
            errorType === "expired" ||
            errorType === "already-used") && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
