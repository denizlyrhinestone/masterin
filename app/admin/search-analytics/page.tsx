"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Search, Loader2 } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/components/auth-provider"
import { format } from "date-fns"

type SearchAnalytics = {
  id: string
  query: string
  user_id: string | null
  results_count: number
  timestamp: string
  created_at: string
}

type PopularSearch = {
  query: string
  count: number
  avg_results: number
}

export default function SearchAnalyticsPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const [searchData, setSearchData] = useState<SearchAnalytics[]>([])
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([])
  const [zeroResultSearches, setZeroResultSearches] = useState<PopularSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState("")
  const [activeTab, setActiveTab] = useState("recent")

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated") {
      checkAdminStatus()
    } else if (status === "unauthenticated") {
      router.push("/auth?redirect=/admin/search-analytics")
    }
  }, [status, router])

  const checkAdminStatus = async () => {
    if (!user) return

    const { data, error } = await supabaseClient.from("user_roles").select("role").eq("user_id", user.id).single()

    if (error || !data || data.role !== "admin") {
      router.push("/")
    }
  }

  // Fetch search analytics data
  useEffect(() => {
    if (status === "authenticated") {
      fetchSearchData()
    }
  }, [status])

  const fetchSearchData = async () => {
    setIsLoading(true)
    try {
      // Recent searches
      const { data: recentData, error: recentError } = await supabaseClient
        .from("search_analytics")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (recentError) throw recentError
      setSearchData(recentData || [])

      // Popular searches
      const { data: popularData, error: popularError } = await supabaseClient.rpc("get_popular_searches")

      if (popularError) throw popularError
      setPopularSearches(popularData || [])

      // Zero result searches
      const { data: zeroData, error: zeroError } = await supabaseClient.rpc("get_zero_result_searches")

      if (zeroError) throw zeroError
      setZeroResultSearches(zeroData || [])
    } catch (error) {
      console.error("Error fetching search analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter search data
  const filteredSearchData = searchData.filter((item) => item.query.toLowerCase().includes(searchFilter.toLowerCase()))

  // Export data as CSV
  const exportCSV = () => {
    const headers = ["Query", "Results", "Timestamp"]
    const csvData = filteredSearchData.map((item) => [
      item.query,
      item.results_count.toString(),
      format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss"),
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `search-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Search Analytics</h1>
          <p className="text-muted-foreground">Monitor and analyze user search behavior</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Searches</TabsTrigger>
          <TabsTrigger value="popular">Popular Searches</TabsTrigger>
          <TabsTrigger value="zero">Zero Results</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Search Queries</CardTitle>
              <CardDescription>View the most recent search queries from users</CardDescription>
              <div className="flex items-center gap-2 mt-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter searches..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredSearchData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No search data available</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Results</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSearchData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.query}</TableCell>
                          <TableCell>{item.results_count}</TableCell>
                          <TableCell>{item.user_id ? item.user_id.substring(0, 8) + "..." : "Anonymous"}</TableCell>
                          <TableCell>{format(new Date(item.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle>Popular Search Queries</CardTitle>
              <CardDescription>Most frequently searched terms and their average results</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : popularSearches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No popular search data available</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Search Count</TableHead>
                        <TableHead>Avg. Results</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {popularSearches.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.query}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{item.avg_results.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zero">
          <Card>
            <CardHeader>
              <CardTitle>Zero Result Searches</CardTitle>
              <CardDescription>Search queries that returned no results</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : zeroResultSearches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No zero result searches available</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Search Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zeroResultSearches.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.query}</TableCell>
                          <TableCell>{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
