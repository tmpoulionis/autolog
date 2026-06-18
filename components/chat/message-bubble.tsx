"use client"

import { ArrowUpRight, NotebookPen, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { SimpleMarkdown } from "@/components/simple-markdown"
import { Badge } from "@/components/ui/badge"
import type { ChatMessage, LogEntry } from "@/lib/types"

interface MessageBubbleProps {
  message: ChatMessage
  entriesById: Map<string, LogEntry>
  onViewEntry: (entryId: string) => void
}

export function MessageBubble({ message, entriesById, onViewEntry }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const citedEntries = (message.citedEntryIds ?? [])
    .map((id) => entriesById.get(id))
    .filter((e): e is LogEntry => Boolean(e))
  const createdEntry = message.createdEntryId ? entriesById.get(message.createdEntryId) : undefined

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
          <Sparkles className="size-4" />
        </div>
      )}

      <div className={cn("flex max-w-[80%] flex-col gap-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <SimpleMarkdown content={message.content} />
          )}
        </div>

        {createdEntry && (
          <button
            type="button"
            onClick={() => onViewEntry(createdEntry.id)}
            className="border-border bg-card hover:bg-accent flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors"
          >
            <NotebookPen className="size-3.5 shrink-0 opacity-70" />
            <span className="font-medium">{createdEntry.title}</span>
            <ArrowUpRight className="size-3.5 shrink-0 opacity-70" />
          </button>
        )}

        {citedEntries.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">Referenced entries</span>
            <div className="flex flex-col gap-1.5">
              {citedEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onViewEntry(entry.id)}
                  className="border-border bg-card hover:bg-accent flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">{entry.title}</span>
                    {entry.tags[0] && (
                      <Badge variant="secondary" className="shrink-0">
                        {entry.tags[0]}
                      </Badge>
                    )}
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 opacity-70" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
          <User className="size-4" />
        </div>
      )}
    </div>
  )
}
