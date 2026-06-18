"use client"

import * as React from "react"
import { CheckSquare, Flag, MoreHorizontal, NotebookText, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SimpleMarkdown } from "@/components/simple-markdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { LogEntry } from "@/lib/types"

const TYPE_ICON = {
  entry: NotebookText,
  milestone: Flag,
  task: CheckSquare,
} as const

interface LogEntryCardProps {
  entry: LogEntry
  highlighted?: boolean
  onEdit: (entry: LogEntry) => void
  onDelete: (id: string) => void
}

export const LogEntryCard = React.forwardRef<HTMLDivElement, LogEntryCardProps>(
  function LogEntryCard({ entry, highlighted, onEdit, onDelete }, ref) {
    const Icon = TYPE_ICON[entry.type]
    const date = new Date(entry.createdAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return (
      <div
        ref={ref}
        className={cn(
          "border-border bg-card relative flex flex-col gap-2 rounded-xl border p-4 transition-colors",
          highlighted && "ring-ring ring-2",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Icon className="size-3.5" />
              <span className="capitalize">{entry.type}</span>
              <span aria-hidden>·</span>
              <time>{date}</time>
            </div>
            <h3 className="text-sm font-semibold leading-snug text-balance">{entry.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Entry options" />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onEdit(entry)}>
                  <Pencil data-icon="inline-start" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(entry.id)}>
                  <Trash2 data-icon="inline-start" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SimpleMarkdown content={entry.body} className="text-muted-foreground" />

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  },
)
