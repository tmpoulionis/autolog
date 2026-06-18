"use client"

import * as React from "react"
import { Menu, NotebookText } from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { AppSidebar } from "@/components/app-sidebar"
import { Conversation } from "@/components/chat/conversation"
import { LogPanel } from "@/components/log/log-panel"

export function AutoLogApp() {
  const { hydrated, currentProject, requestJumpToEntry } = useStore()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [logTab, setLogTab] = React.useState("log")

  const handleViewEntry = React.useCallback(
    (entryId: string) => {
      setLogTab("log")
      requestJumpToEntry(entryId)
      setPanelOpen(true)
    },
    [requestJumpToEntry],
  )

  if (!hydrated) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="flex w-full max-w-2xl flex-col gap-4 px-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background flex h-svh overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="border-border hidden w-64 shrink-0 border-r md:block">
        <AppSidebar />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="border-border flex items-center justify-between gap-2 border-b px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open projects" />}
              >
                <Menu data-icon />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Projects</SheetTitle>
                <AppSidebar onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <h2 className="truncate text-sm font-semibold">
              {currentProject?.name ?? "AutoLog"}
            </h2>
          </div>

          {/* Open log panel on small screens */}
          <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
            <SheetTrigger render={<Button variant="outline" size="sm" className="lg:hidden" />}>
              <NotebookText data-icon="inline-start" />
              Log
            </SheetTrigger>
            <SheetContent side="right" className="w-full p-0 sm:max-w-md">
              <SheetTitle className="sr-only">Project log and tasks</SheetTitle>
              <LogPanel tab={logTab} onTabChange={setLogTab} onClose={() => setPanelOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Conversation + persistent log panel */}
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1">
            <Conversation onViewEntry={handleViewEntry} />
          </main>
          <aside className="border-border hidden w-[26rem] shrink-0 border-l lg:block xl:w-[30rem]">
            <LogPanel tab={logTab} onTabChange={setLogTab} />
          </aside>
        </div>
      </div>
    </div>
  )
}
