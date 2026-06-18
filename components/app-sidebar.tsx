"use client"

import * as React from "react"
import { FileText, MoreHorizontal, Pencil, Plus, Trash2, NotebookPen } from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProjectDialog } from "@/components/project-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Project } from "@/lib/types"

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { projects, currentProjectId, selectProject, createProject, renameProject, deleteProject } =
    useStore()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Project | null>(null)
  const [deleting, setDeleting] = React.useState<Project | null>(null)

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full w-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg">
          <NotebookPen className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none">AutoLog</span>
          <span className="text-sidebar-foreground/60 text-xs">Project logs</span>
        </div>
      </div>

      <div className="px-3 pb-2">
        <Button className="w-full justify-start" variant="secondary" onClick={() => setCreateOpen(true)}>
          <Plus data-icon="inline-start" />
          New project
        </Button>
      </div>

      <div className="text-sidebar-foreground/50 px-4 pb-1 pt-3 text-xs font-medium uppercase tracking-wide">
        Projects
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="flex flex-col gap-0.5 pb-2">
          {projects.map((project) => {
            const active = project.id === currentProjectId
            return (
              <div
                key={project.id}
                className={cn(
                  "group/item flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80",
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  onClick={() => {
                    selectProject(project.id)
                    onNavigate?.()
                  }}
                >
                  <FileText className="size-4 shrink-0 opacity-70" />
                  <span className="truncate">{project.name}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 opacity-0 group-hover/item:opacity-100 data-[popup-open]:opacity-100"
                        aria-label="Project options"
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setEditing(project)}>
                        <Pencil data-icon="inline-start" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleting(project)}>
                        <Trash2 data-icon="inline-start" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-sidebar-border flex items-center justify-between border-t px-3 py-2">
        <span className="text-sidebar-foreground/50 px-1 text-xs">{projects.length} projects</span>
        <ThemeToggle />
      </div>

      <ProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={(name, description) => createProject(name, description)}
      />

      <ProjectDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        mode="edit"
        initialName={editing?.name}
        initialDescription={editing?.description}
        onSubmit={(name, description) => {
          if (editing) renameProject(editing.id, name, description)
        }}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `"${deleting.name}" and all of its log entries and tasks will be permanently removed. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteProject(deleting.id)
                setDeleting(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
