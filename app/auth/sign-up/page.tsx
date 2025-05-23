import type { Metadata } from "next"
import SignUpPageClient from "./SignUpPageClient"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new EduNext account",
}

interface SignUpPageProps {
  searchParams: {
    callbackUrl?: string
  }
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  return <SignUpPageClient searchParams={searchParams} />
}
