"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type SubjectSelectorProps = {
  selectedSubject: string
  onSelectSubject: (subject: string) => void
}

const subjects = [
  { id: "general", name: "General" },
  { id: "math", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "language", name: "Language Arts" },
  { id: "history", name: "History" },
  { id: "computer-science", name: "Computer Science" },
]

export function SubjectSelector({ selectedSubject, onSelectSubject }: SubjectSelectorProps) {
  const selectedSubjectName = subjects.find((s) => s.id === selectedSubject)?.name || "Select Subject"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-1 border-gray-300 text-sm transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          <span>Subject: {selectedSubjectName}</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
      >
        <DropdownMenuGroup>
          {subjects.map((subject) => (
            <DropdownMenuItem
              key={subject.id}
              onClick={() => onSelectSubject(subject.id)}
              className={cn(
                "flex cursor-pointer items-center justify-between transition-colors duration-200",
                selectedSubject === subject.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900",
              )}
            >
              {subject.name}
              {selectedSubject === subject.id && <Check className="h-4 w-4 text-emerald-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
