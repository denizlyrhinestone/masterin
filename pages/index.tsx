"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { checkUserAuthentication } from "@/lib/auth-utils"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const { isAuthenticated } = await checkUserAuthentication()
      setIsAuthenticated(isAuthenticated)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      {isAuthenticated ? <p>You are logged in!</p> : <p>Please log in to access all features</p>}
    </div>
  )
}
