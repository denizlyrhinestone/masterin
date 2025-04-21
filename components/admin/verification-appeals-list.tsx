"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Loader2, ExternalLink } from "lucide-react"

export function VerificationAppealsList() {
  const router = useRouter()
  const [appeals, setAppeals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        setIsLoading(true)

        const { data, error } = await supabase
          .from("educator_verification_appeals")
          .select(`
            id,
            request_id,
            user_id,
            appeal_reason,
            additional_document_url,
            status,
            created_at,
            profiles:user_id (
              full_name,
              email
            ),
            educator_verification_requests:request_id (
              institution,
              credentials
            )
          `)
          .order("created_at", { ascending: false })

        if (error) throw error

        setAppeals(data || [])
      } catch (error) {
        console.error("Error fetching appeals:", error)
        toast({
          title: "Error",
          description: "Failed to load verification appeals",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppeals()
  }, [supabase])

  const handleViewAppeal = (id: string) => {
    router.push(`/admin/verification-appeals/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Appeals</CardTitle>
      </CardHeader>
      <CardContent>
        {appeals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No verification appeals found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Educator</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appeals.map((appeal) => (
                <TableRow key={appeal.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appeal.profiles?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{appeal.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{appeal.educator_verification_requests?.institution || "N/A"}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        appeal.status === "pending"
                          ? "outline"
                          : appeal.status === "approved"
                            ? "success"
                            : "destructive"
                      }
                    >
                      {appeal.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewAppeal(appeal.id)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
