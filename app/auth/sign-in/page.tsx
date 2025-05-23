import type { Metadata } from "next"
import SignInClientPage from "./SignInClientPage"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your EduNext account",
}

interface SignInPageProps {
  searchParams: {
    callbackUrl?: string
    error?: string
  }
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  return <SignInClientPage searchParams={searchParams} />
}
