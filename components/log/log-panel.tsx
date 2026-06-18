"use client"

import * as React from "react"
import { ListTodo, NotebookText, PanelRightClose } from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogViewer } from "@/components/log/log-viewer"
import { TaskList } from "@/components/tasks/task-list"
import { ExportMenu } from "@/components/log/export-menu"

interface LogPanelProps {
  tab: string
  onTabChange: (tab: string) => void
  onClose?: () => void
}

export function LogPanel({ tab, onTabChange, onClose }: LogPanelProps) {
  const { currentProject, entries, tasks } = useStore()
  const openTasks = tasks.filter((t) => !t.done).length

  return (
    <Tabs value={tab} onValueChange={onTabChange} className="flex h-full flex-col gap-0">
      <div className="border-border flex items-center justify-between gap-2 border-b p-3">
        <TabsList>
          <TabsTrigger value="log">
            <NotebookText data-icon="inline-start" />
            Log
            <span className="text-muted-foreground ml-1 text-xs">{entries.length}</span>
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo data-icon="inline-start" />
            Tasks
            {openTasks > 0 && <span className="text-muted-foreground ml-1 text-xs">{openTasks}</span>}
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-1">
          {currentProject && <ExportMenu project={currentProject} entries={entries} />}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel" className="lg:hidden">
              <PanelRightClose data-icon />
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="log" className="min-h-0 flex-1 outline-none">
        <LogViewer />
      </TabsContent>
      <TabsContent value="tasks" className="min-h-0 flex-1 outline-none">
        <TaskList />
      </TabsContent>
    </Tabs>
  )
}
