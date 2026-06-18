import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Minimal markdown renderer for the subset we generate: bullet lists,
 * paragraphs, and inline **bold**. Avoids a heavy dependency for the small,
 * controlled markdown our agent produces.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>
  })
}

export function SimpleMarkdown({ content, className }: { content: string; className?: string }) {
  const lines = content.split("\n")
  const blocks: React.ReactNode[] = []
  let listBuffer: string[] = []

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return
    blocks.push(
      <ul key={key} className="flex list-disc flex-col gap-1 pl-5">
        {listBuffer.map((item, i) => (
          <li key={`${key}-${i}`} className="leading-relaxed">
            {renderInline(item, `${key}-${i}`)}
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (/^[-*]\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^[-*]\s+/, ""))
    } else if (trimmed === "") {
      flushList(`list-${i}`)
    } else {
      flushList(`list-${i}`)
      blocks.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {renderInline(trimmed, `p-${i}`)}
        </p>,
      )
    }
  })
  flushList("list-end")

  return <div className={cn("flex flex-col gap-2 text-sm", className)}>{blocks}</div>
}
