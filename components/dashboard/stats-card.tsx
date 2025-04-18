import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  icon: ReactNode
  value: string | number
  label: string
  iconColor?: string
}

export function StatsCard({ icon, value, label, iconColor = "text-primary" }: StatsCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <div className={`mb-2 ${iconColor}`}>{icon}</div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
