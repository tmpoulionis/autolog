"use client"

import * as React from "react"
import { ListTodo, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import type { Task } from "@/lib/types"

export function TaskList() {
  const { tasks, addTask, toggleTask, deleteTask } = useStore()
  const [value, setValue] = React.useState("")

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    addTask(value)
    setValue("")
  }

  const handleToggle = (task: Task) => {
    toggleTask(task.id)
    if (!task.done) {
      toast.success("Task completed", { description: `Logged "${task.title}" to your project log.` })
    }
  }

  const openCount = tasks.filter((t) => !t.done).length

  return (
    <div className="flex h-full flex-col">
      <form onSubmit={add} className="border-border flex gap-2 border-b p-3">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task"
        />
        <Button type="submit" size="icon" disabled={!value.trim()} aria-label="Add task">
          <Plus data-icon />
        </Button>
      </form>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1.5 p-3">
          {tasks.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListTodo />
                </EmptyMedia>
                <EmptyTitle>No tasks yet</EmptyTitle>
                <EmptyDescription>
                  Add tasks here. When you check one off, it&apos;s automatically logged to your project log.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="group/task border-border bg-card flex items-start gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.done}
                  onCheckedChange={() => handleToggle(task)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "flex-1 cursor-pointer text-sm leading-snug",
                    task.done && "text-muted-foreground line-through",
                  )}
                >
                  {task.title}
                  {task.done && task.completedAt && (
                    <span className="text-muted-foreground mt-0.5 block text-xs no-underline">
                      Completed{" "}
                      {new Date(task.completedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 opacity-0 group-hover/task:opacity-100"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {tasks.length > 0 && (
        <div className="border-border text-muted-foreground border-t px-4 py-2 text-xs">
          {openCount} open · {tasks.length - openCount} completed
        </div>
      )}
    </div>
  )
}
