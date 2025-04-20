"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type VerificationStats = {
  total: number
  pending: number
  approved: number
  rejected: number
}

export function VerificationAnalytics() {
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("all")
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchVerificationStats() {
      try {
        setLoading(true)

        // Base query
        let query = supabase.from("educator_verification_requests").select("status", { count: "exact" })

        // Apply timeframe filter
        if (timeframe === "week") {
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          query = query.gte("created_at", oneWeekAgo.toISOString())
        } else if (timeframe === "month") {
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          query = query.gte("created_at", oneMonthAgo.toISOString())
        }

        // Get total count
        const { count: total, error: totalError } = await query

        if (totalError) {
          console.error("Error fetching verification stats:", totalError)
          return
        }

        // Get counts by status
        const { data: statusCounts, error: statusError } = await supabase
          .from("educator_verification_requests")
          .select("status, count")
          .then((result) => {
            // This is a workaround since we can't do real GROUP BY in the client
            const counts = { pending: 0, approved: 0, rejected: 0 }
            result.data?.forEach((item) => {
              if (item.status === "pending") counts.pending++
              if (item.status === "approved") counts.approved++
              if (item.status === "rejected") counts.rejected++
            })
            return { data: counts, error: result.error }
          })

        if (statusError) {
          console.error("Error fetching verification stats by status:", statusError)
          return
        }

        setStats({
          total: total || 0,
          pending: statusCounts?.pending || 0,
          approved: statusCounts?.approved || 0,
          rejected: statusCounts?.rejected || 0,
        })
      } catch (error) {
        console.error("Error in fetchVerificationStats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVerificationStats()
  }, [supabase, timeframe])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Analytics</CardTitle>
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "week" | "month" | "all")}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading analytics...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">Total Requests</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <div className="text-sm font-medium">Pending</div>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <div className="text-sm font-medium">Approved</div>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <div className="text-sm font-medium">Rejected</div>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
