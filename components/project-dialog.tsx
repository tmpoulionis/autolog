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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialName?: string
  initialDescription?: string
  onSubmit: (name: string, description: string) => void
}

export function ProjectDialog({
  open,
  onOpenChange,
  mode,
  initialName = "",
  initialDescription = "",
  onSubmit,
}: ProjectDialogProps) {
  const [name, setName] = React.useState(initialName)
  const [description, setDescription] = React.useState(initialDescription)

  React.useEffect(() => {
    if (open) {
      setName(initialName)
      setDescription(initialDescription)
    }
  }, [open, initialName, initialDescription])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), description.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "New project" : "Edit project"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a project to start a fresh log and task list."
                : "Update the name and description for this project."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="project-name">Name</FieldLabel>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thesis experiments"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="project-description">Description</FieldLabel>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {mode === "create" ? "Create project" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
