"use client"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import SignUpForm from "@/components/auth/sign-up-form"

interface SignUpPageProps {
  searchParams: {
    callbackUrl?: string
  }
}

export default async function SignUpPageClient({ searchParams }: SignUpPageProps) {
  const session = await auth()

  // Redirect to dashboard if already signed in
  if (session) {
    redirect(searchParams.callbackUrl || "/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter your information to create an account</p>
        </div>

        <SignUpForm callbackUrl={searchParams.callbackUrl} />

        <p className="px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="hover:text-brand underline underline-offset-4">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:text-brand underline underline-offset-4">
            Privacy Policy
          </Link>
        </p>

        <p className="px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="hover:text-brand underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
