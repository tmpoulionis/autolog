"use client"

import * as React from "react"
import { ArrowUp, NotebookPen, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type ComposerMode = "log" | "ask"

interface ComposerProps {
  mode: ComposerMode
  onModeChange: (mode: ComposerMode) => void
  onSubmit: (text: string) => void
  disabled?: boolean
}

export function Composer({ mode, onModeChange, onSubmit, disabled }: ComposerProps) {
  const [value, setValue] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const resize = React.useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [])

  React.useEffect(() => {
    resize()
  }, [value, resize])

  const submit = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSubmit(text)
    setValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-border bg-card focus-within:border-ring/60 flex flex-col gap-2 rounded-2xl border p-2 shadow-sm transition-colors">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={
          mode === "log"
            ? "Jot down what you worked on — I'll clean it into a log entry…"
            : "Ask anything about this project's log…"
        }
        className="placeholder:text-muted-foreground max-h-[200px] w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed outline-none"
        aria-label={mode === "log" ? "Log entry input" : "Question input"}
      />
      <div className="flex items-center justify-between gap-2">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => v && onModeChange(v as ComposerMode)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="log" aria-label="Log mode">
            <NotebookPen data-icon="inline-start" />
            Log
          </ToggleGroupItem>
          <ToggleGroupItem value="ask" aria-label="Ask mode">
            <Search data-icon="inline-start" />
            Ask
          </ToggleGroupItem>
        </ToggleGroup>

        <Button
          size="icon"
          className={cn("rounded-full")}
          onClick={submit}
          disabled={!value.trim() || disabled}
          aria-label="Send"
        >
          <ArrowUp data-icon />
        </Button>
      </div>
    </div>
  )
}
