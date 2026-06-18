"use client"

import * as React from "react"
import { answerQuestion, formatNote } from "./mock-agent"
import type { ChatMessage, LogEntry, Project, Task } from "./types"

/**
 * Client-side store backed by localStorage.
 *
 * This is intentionally isolated behind a small hook-based API so that the
 * persistence layer can later be replaced with Convex queries/mutations
 * (and the agent calls with real model + RAG calls) without changing the UI.
 */

interface DB {
  projects: Project[]
  entries: LogEntry[]
  tasks: Task[]
  messages: ChatMessage[]
  currentProjectId: string | null
}

const STORAGE_KEY = "autolog:db:v1"

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function seed(): DB {
  const now = Date.now()
  const day = 86_400_000
  const projectId = uid()
  const project: Project = {
    id: projectId,
    name: "Thesis: Neural Audio Denoising",
    description: "Research log for a masters thesis on real-time neural audio denoising.",
    createdAt: now - day * 12,
  }

  const entries: LogEntry[] = [
    {
      id: uid(),
      projectId,
      title: "Project kickoff and scope",
      body: "- Defined the research question around low-latency denoising\n- Collected an initial reading list of 14 papers\n- Set up the Python environment and repo structure",
      tags: ["research", "docs"],
      type: "milestone",
      createdAt: now - day * 12,
    },
    {
      id: uid(),
      projectId,
      title: "Built the baseline spectral gating model",
      body: "- Implemented a baseline using classic spectral gating\n- Measured 2.1 dB SNR improvement on the test clips\n- Noted heavy musical-noise artifacts on speech",
      tags: ["feature", "data"],
      type: "entry",
      createdAt: now - day * 9,
    },
    {
      id: uid(),
      projectId,
      title: "Fixed dataset leakage in the loader",
      body: "- Found overlapping clips between train and validation splits\n- Rewrote the split logic to be speaker-disjoint\n- Re-ran the baseline; metrics dropped slightly but are now trustworthy",
      tags: ["bug", "data"],
      type: "entry",
      createdAt: now - day * 6,
    },
    {
      id: uid(),
      projectId,
      title: "First U-Net experiment",
      body: "- Trained a small U-Net on log-mel spectrograms\n- Reached 4.3 dB SNR improvement, clearly beating the baseline\n- Training is slow; need to profile the data pipeline",
      tags: ["research", "performance"],
      type: "entry",
      createdAt: now - day * 3,
    },
  ]

  const tasks: Task[] = [
    {
      id: uid(),
      projectId,
      title: "Profile the data loading bottleneck",
      done: false,
      createdAt: now - day * 3,
      completedAt: null,
      loggedEntryId: null,
    },
    {
      id: uid(),
      projectId,
      title: "Add real-time inference benchmark",
      done: false,
      createdAt: now - day * 2,
      completedAt: null,
      loggedEntryId: null,
    },
    {
      id: uid(),
      projectId,
      title: "Write the related-work section",
      done: false,
      createdAt: now - day,
      completedAt: null,
      loggedEntryId: null,
    },
  ]

  const messages: ChatMessage[] = [
    {
      id: uid(),
      projectId,
      role: "assistant",
      content:
        "Welcome to your project log. Drop a rough note about what you worked on and I'll clean it into a log entry — or switch to Ask mode to query everything you've logged so far.",
      kind: "ask",
      createdAt: now - day * 12,
    },
  ]

  return { projects: [project], entries, tasks, messages, currentProjectId: projectId }
}

function load(): DB {
  if (typeof window === "undefined") return { projects: [], entries: [], tasks: [], messages: [], currentProjectId: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seed()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
    return JSON.parse(raw) as DB
  } catch {
    return seed()
  }
}

interface StoreContextValue {
  hydrated: boolean
  projects: Project[]
  currentProject: Project | null
  currentProjectId: string | null
  entries: LogEntry[]
  tasks: Task[]
  messages: ChatMessage[]
  isThinking: boolean
  selectProject: (id: string) => void
  createProject: (name: string, description?: string) => void
  renameProject: (id: string, name: string, description?: string) => void
  deleteProject: (id: string) => void
  submitNote: (text: string) => Promise<void>
  askAgent: (text: string) => Promise<void>
  updateEntry: (id: string, patch: Partial<Pick<LogEntry, "title" | "body" | "tags">>) => void
  deleteEntry: (id: string) => void
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  jumpToEntryId: string | null
  requestJumpToEntry: (id: string | null) => void
}

const StoreContext = React.createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = React.useState<DB>(() => ({
    projects: [],
    entries: [],
    tasks: [],
    messages: [],
    currentProjectId: null,
  }))
  const [hydrated, setHydrated] = React.useState(false)
  const [isThinking, setIsThinking] = React.useState(false)
  const [jumpToEntryId, setJumpToEntryId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setDb(load())
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch {
      // ignore quota / serialization errors in this mock layer
    }
  }, [db, hydrated])

  const currentProject =
    db.projects.find((p) => p.id === db.currentProjectId) ?? db.projects[0] ?? null
  const currentProjectId = currentProject?.id ?? null

  const entries = React.useMemo(
    () =>
      db.entries
        .filter((e) => e.projectId === currentProjectId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [db.entries, currentProjectId],
  )
  const tasks = React.useMemo(
    () =>
      db.tasks
        .filter((t) => t.projectId === currentProjectId)
        .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt),
    [db.tasks, currentProjectId],
  )
  const messages = React.useMemo(
    () =>
      db.messages
        .filter((m) => m.projectId === currentProjectId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [db.messages, currentProjectId],
  )

  const selectProject = React.useCallback((id: string) => {
    setDb((prev) => ({ ...prev, currentProjectId: id }))
  }, [])

  const createProject = React.useCallback((name: string, description = "") => {
    const id = uid()
    const project: Project = { id, name: name.trim() || "Untitled project", description, createdAt: Date.now() }
    const welcome: ChatMessage = {
      id: uid(),
      projectId: id,
      role: "assistant",
      content:
        "New project created. Log your first note about what you're working on and I'll format it into a clean entry.",
      kind: "ask",
      createdAt: Date.now(),
    }
    setDb((prev) => ({
      ...prev,
      projects: [project, ...prev.projects],
      messages: [...prev.messages, welcome],
      currentProjectId: id,
    }))
  }, [])

  const renameProject = React.useCallback((id: string, name: string, description?: string) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, name: name.trim() || p.name, description: description ?? p.description } : p,
      ),
    }))
  }, [])

  const deleteProject = React.useCallback((id: string) => {
    setDb((prev) => {
      const projects = prev.projects.filter((p) => p.id !== id)
      const nextCurrent = prev.currentProjectId === id ? (projects[0]?.id ?? null) : prev.currentProjectId
      return {
        projects,
        entries: prev.entries.filter((e) => e.projectId !== id),
        tasks: prev.tasks.filter((t) => t.projectId !== id),
        messages: prev.messages.filter((m) => m.projectId !== id),
        currentProjectId: nextCurrent,
      }
    })
  }, [])

  const submitNote = React.useCallback(
    async (text: string) => {
      const projectId = currentProjectId
      if (!projectId || !text.trim()) return
      const userMsg: ChatMessage = {
        id: uid(),
        projectId,
        role: "user",
        content: text.trim(),
        kind: "log",
        createdAt: Date.now(),
      }
      setDb((prev) => ({ ...prev, messages: [...prev.messages, userMsg] }))
      setIsThinking(true)
      try {
        const formatted = await formatNote(text)
        const entryId = uid()
        const entry: LogEntry = {
          id: entryId,
          projectId,
          title: formatted.title,
          body: formatted.body,
          tags: formatted.tags,
          type: formatted.type,
          createdAt: Date.now(),
        }
        const assistantMsg: ChatMessage = {
          id: uid(),
          projectId,
          role: "assistant",
          content: `I've logged this as **${formatted.title}**.`,
          kind: "log",
          createdEntryId: entryId,
          createdAt: Date.now(),
        }
        setDb((prev) => ({
          ...prev,
          entries: [...prev.entries, entry],
          messages: [...prev.messages, assistantMsg],
        }))
      } finally {
        setIsThinking(false)
      }
    },
    [currentProjectId],
  )

  const askAgent = React.useCallback(
    async (text: string) => {
      const projectId = currentProjectId
      if (!projectId || !text.trim()) return
      const projectEntries = db.entries
        .filter((e) => e.projectId === projectId)
        .sort((a, b) => b.createdAt - a.createdAt)
      const userMsg: ChatMessage = {
        id: uid(),
        projectId,
        role: "user",
        content: text.trim(),
        kind: "ask",
        createdAt: Date.now(),
      }
      setDb((prev) => ({ ...prev, messages: [...prev.messages, userMsg] }))
      setIsThinking(true)
      try {
        const answer = await answerQuestion(text, projectEntries)
        const assistantMsg: ChatMessage = {
          id: uid(),
          projectId,
          role: "assistant",
          content: answer.content,
          kind: "ask",
          citedEntryIds: answer.citedEntryIds,
          createdAt: Date.now(),
        }
        setDb((prev) => ({ ...prev, messages: [...prev.messages, assistantMsg] }))
      } finally {
        setIsThinking(false)
      }
    },
    [currentProjectId, db.entries],
  )

  const updateEntry = React.useCallback(
    (id: string, patch: Partial<Pick<LogEntry, "title" | "body" | "tags">>) => {
      setDb((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }))
    },
    [],
  )

  const deleteEntry = React.useCallback((id: string) => {
    setDb((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }))
  }, [])

  const addTask = React.useCallback(
    (title: string) => {
      const projectId = currentProjectId
      if (!projectId || !title.trim()) return
      const task: Task = {
        id: uid(),
        projectId,
        title: title.trim(),
        done: false,
        createdAt: Date.now(),
        completedAt: null,
        loggedEntryId: null,
      }
      setDb((prev) => ({ ...prev, tasks: [...prev.tasks, task] }))
    },
    [currentProjectId],
  )

  const toggleTask = React.useCallback((id: string) => {
    setDb((prev) => {
      const task = prev.tasks.find((t) => t.id === id)
      if (!task) return prev
      const nowDone = !task.done

      if (nowDone) {
        // Completing a task auto-creates a log entry.
        const entryId = uid()
        const entry: LogEntry = {
          id: entryId,
          projectId: task.projectId,
          title: `Completed: ${task.title}`,
          body: `- Marked the task "${task.title}" as complete`,
          tags: ["task"],
          type: "task",
          createdAt: Date.now(),
        }
        return {
          ...prev,
          entries: [...prev.entries, entry],
          tasks: prev.tasks.map((t) =>
            t.id === id ? { ...t, done: true, completedAt: Date.now(), loggedEntryId: entryId } : t,
          ),
        }
      }

      // Un-completing removes the auto-created entry.
      return {
        ...prev,
        entries: prev.entries.filter((e) => e.id !== task.loggedEntryId),
        tasks: prev.tasks.map((t) =>
          t.id === id ? { ...t, done: false, completedAt: null, loggedEntryId: null } : t,
        ),
      }
    })
  }, [])

  const deleteTask = React.useCallback((id: string) => {
    setDb((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }))
  }, [])

  const requestJumpToEntry = React.useCallback((id: string | null) => {
    setJumpToEntryId(id)
  }, [])

  const value: StoreContextValue = {
    hydrated,
    projects: db.projects,
    currentProject,
    currentProjectId,
    entries,
    tasks,
    messages,
    isThinking,
    selectProject,
    createProject,
    renameProject,
    deleteProject,
    submitNote,
    askAgent,
    updateEntry,
    deleteEntry,
    addTask,
    toggleTask,
    deleteTask,
    jumpToEntryId,
    requestJumpToEntry,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within a StoreProvider")
  return ctx
}
