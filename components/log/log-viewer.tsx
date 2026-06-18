"use client"

import * as React from "react"
import { NotebookText, Search } from "lucide-react"
import { useStore } from "@/lib/store"
import { LogEntryCard } from "@/components/log/log-entry-card"
import { EntryEditDialog } from "@/components/log/entry-edit-dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import type { LogEntry } from "@/lib/types"

export function LogViewer() {
  const { entries, updateEntry, deleteEntry, jumpToEntryId, requestJumpToEntry } = useStore()
  const [query, setQuery] = React.useState("")
  const [editing, setEditing] = React.useState<LogEntry | null>(null)
  const entryRefs = React.useRef<Map<string, HTMLDivElement>>(new Map())

  React.useEffect(() => {
    if (!jumpToEntryId) return
    const el = entryRefs.current.get(jumpToEntryId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      const timer = setTimeout(() => requestJumpToEntry(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [jumpToEntryId, requestJumpToEntry])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q) ||
        e.tags.some((t) => t.includes(q)),
    )
  }, [entries, query])

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b p-3">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the log…"
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-3">
          {filtered.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <NotebookText />
                </EmptyMedia>
                <EmptyTitle>{entries.length === 0 ? "No entries yet" : "No matches"}</EmptyTitle>
                <EmptyDescription>
                  {entries.length === 0
                    ? "Log a note in the chat and it will show up here."
                    : "Try a different search term."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            filtered.map((entry) => (
              <LogEntryCard
                key={entry.id}
                entry={entry}
                highlighted={entry.id === jumpToEntryId}
                ref={(el) => {
                  if (el) entryRefs.current.set(entry.id, el)
                  else entryRefs.current.delete(entry.id)
                }}
                onEdit={setEditing}
                onDelete={deleteEntry}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <EntryEditDialog
        entry={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={(id, patch) => updateEntry(id, patch)}
      />
    </div>
  )
}
