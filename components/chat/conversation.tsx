"use client"

import * as React from "react"
import { NotebookPen, Search, Sparkles } from "lucide-react"
import { useStore } from "@/lib/store"
import { Composer, type ComposerMode } from "@/components/chat/composer"
import { MessageBubble } from "@/components/chat/message-bubble"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { LogEntry } from "@/lib/types"

const LOG_SUGGESTIONS = [
  "fixed the data loader bug, splits are speaker-disjoint now",
  "trained a small unet, got 4.3 dB snr, beats baseline",
  "read 3 papers on diffusion-based denoising, took notes",
]

const ASK_SUGGESTIONS = [
  "What have I tried so far for denoising?",
  "When did I fix the dataset issue?",
  "Summarize my progress this week",
]

interface ConversationProps {
  onViewEntry: (entryId: string) => void
}

export function Conversation({ onViewEntry }: ConversationProps) {
  const { messages, entries, currentProject, isThinking, submitNote, askAgent } = useStore()
  const [mode, setMode] = React.useState<ComposerMode>("log")
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const entriesById = React.useMemo(() => {
    const map = new Map<string, LogEntry>()
    for (const e of entries) map.set(e.id, e)
    return map
  }, [entries])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, isThinking])

  const handleSubmit = (text: string) => {
    if (mode === "log") void submitNote(text)
    else void askAgent(text)
  }

  const showGreeting = messages.length <= 1
  const suggestions = mode === "log" ? LOG_SUGGESTIONS : ASK_SUGGESTIONS

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
          {showGreeting ? (
            <div className="flex flex-col gap-6 pt-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  {currentProject ? currentProject.name : "Welcome to AutoLog"}
                </h1>
                <p className="text-muted-foreground text-pretty">
                  {currentProject?.description ||
                    "Capture rough notes and let the agent turn them into a clean, searchable log."}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  {mode === "log" ? (
                    <>
                      <NotebookPen className="size-3.5" /> Try logging something
                    </>
                  ) : (
                    <>
                      <Search className="size-3.5" /> Try asking
                    </>
                  )}
                </span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSubmit(s)}
                      disabled={isThinking}
                      className="border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground rounded-xl border p-3 text-left text-sm leading-snug transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  entriesById={entriesById}
                  onViewEntry={onViewEntry}
                />
              ))}
            </>
          )}

          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                <Sparkles className="size-4" />
              </div>
              <div className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="size-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="size-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="size-2 animate-bounce rounded-full bg-current" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-border bg-background/80 border-t backdrop-blur">
        <div className="mx-auto w-full max-w-2xl px-4 py-4">
          <Composer mode={mode} onModeChange={setMode} onSubmit={handleSubmit} disabled={isThinking} />
          <p className="text-muted-foreground mt-2 text-center text-xs">
            {mode === "log"
              ? "Log mode — your note becomes a clean entry in the project log."
              : "Ask mode — the agent searches your log and cites the entries it used."}
          </p>
        </div>
      </div>
    </div>
  )
}
