"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

type AuditLog = {
  id: number
  user_id: string
  action_type: string
  description: string
  ip_address: string
  user_agent: string
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        setLoading(true)

        let query = supabase
          .from("admin_audit_logs")
          .select(`
            id, 
            user_id, 
            action_type, 
            description, 
            ip_address, 
            user_agent, 
            created_at,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1)

        if (searchTerm) {
          query = query.or(`action_type.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching audit logs:", error)
          return
        }

        setLogs(data || [])
      } catch (error) {
        console.error("Error in fetchAuditLogs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuditLogs()
  }, [supabase, page, searchTerm])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Audit Logs</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search by action or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading audit logs...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}</TableCell>
                      <TableCell>
                        {log.profiles?.full_name || "Unknown"}
                        <div className="text-xs text-muted-foreground">
                          {log.profiles?.email || log.user_id || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.action_type}</TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>{log.ip_address}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={logs.length < pageSize}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
