export type EntryType = "entry" | "task" | "milestone"

export interface LogEntry {
  id: string
  projectId: string
  title: string
  /** Markdown body of the cleaned-up entry. */
  body: string
  tags: string[]
  type: EntryType
  createdAt: number
}

export interface Task {
  id: string
  projectId: string
  title: string
  done: boolean
  createdAt: number
  completedAt: number | null
  /** Id of the log entry created when this task was completed. */
  loggedEntryId: string | null
}

export type MessageRole = "user" | "assistant"

/** Whether the user message was a log note or a question to the agent. */
export type MessageKind = "log" | "ask"

export interface ChatMessage {
  id: string
  projectId: string
  role: MessageRole
  content: string
  kind: MessageKind
  /** Entry ids the assistant cited when answering a question. */
  citedEntryIds?: string[]
  /** Entry id created from a log note, so the UI can link to it. */
  createdEntryId?: string
  createdAt: number
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: number
}
