"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import type { LogEntry } from "@/lib/types"

interface EntryEditDialogProps {
  entry: LogEntry | null
  onOpenChange: (open: boolean) => void
  onSave: (id: string, patch: { title: string; body: string; tags: string[] }) => void
}

export function EntryEditDialog({ entry, onOpenChange, onSave }: EntryEditDialogProps) {
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [tags, setTags] = React.useState("")

  React.useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setBody(entry.body)
      setTags(entry.tags.join(", "))
    }
  }, [entry])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry) return
    onSave(entry.id, {
      title: title.trim() || entry.title,
      body: body.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={entry !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Edit log entry</DialogTitle>
            <DialogDescription>Refine the entry the agent created. Markdown is supported.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="entry-title">Title</FieldLabel>
              <Input id="entry-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            </Field>
            <Field>
              <FieldLabel htmlFor="entry-body">Body</FieldLabel>
              <Textarea
                id="entry-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
              <FieldDescription>Use {"`- `"} for bullet points and {"**text**"} for bold.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="entry-tags">Tags</FieldLabel>
              <Input
                id="entry-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma, separated, tags"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
