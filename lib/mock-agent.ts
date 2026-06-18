import type { EntryType, LogEntry } from "./types"

/**
 * Mock AI agent.
 *
 * This module fakes the behavior of the real AI agent so the UI can be built
 * and exercised without a model or backend. The function signatures mirror the
 * shape we expect from the real implementation (async, structured I/O), so the
 * internals can be swapped for a Convex action + model call later without
 * touching the UI.
 */

export interface FormattedEntry {
  title: string
  body: string
  tags: string[]
  type: EntryType
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "with",
  "is", "was", "were", "be", "been", "it", "this", "that", "i", "we", "you",
  "my", "our", "so", "then", "also", "just", "today", "now", "ok", "okay",
  "got", "did", "do", "done", "had", "has", "have", "at", "as", "by", "from",
])

const TAG_KEYWORDS: Record<string, string[]> = {
  bug: ["bug", "fix", "fixed", "error", "crash", "broken", "issue", "regression"],
  feature: ["feature", "added", "add", "implement", "implemented", "built", "build", "new"],
  refactor: ["refactor", "refactored", "cleanup", "clean", "restructure", "rename"],
  performance: ["perf", "performance", "optimize", "optimized", "faster", "slow", "latency"],
  research: ["research", "read", "paper", "experiment", "explore", "investigate", "tried"],
  docs: ["doc", "docs", "documentation", "readme", "wrote", "notes"],
  testing: ["test", "tests", "testing", "coverage", "spec"],
  deploy: ["deploy", "deployed", "release", "released", "ship", "shipped", "production"],
  design: ["design", "ui", "ux", "layout", "style", "css", "figma"],
  data: ["data", "dataset", "database", "schema", "migration", "query", "sql"],
}

const MILESTONE_WORDS = ["milestone", "launched", "shipped", "released", "completed", "finished", "v1", "1.0"]

function titleCase(text: string): string {
  const t = text.trim()
  if (!t) return ""
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function deriveTags(text: string): string[] {
  const lower = text.toLowerCase()
  const tags: string[] = []
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) tags.push(tag)
  }
  return tags.slice(0, 4)
}

function deriveType(text: string): EntryType {
  const lower = text.toLowerCase()
  if (MILESTONE_WORDS.some((w) => lower.includes(w))) return "milestone"
  return "entry"
}

function makeTitle(raw: string): string {
  const firstLine = raw.split(/\n+/)[0].trim()
  const firstSentence = firstLine.split(/[.!?]/)[0].trim()
  const base = firstSentence || firstLine
  const words = base.split(/\s+/).slice(0, 9).join(" ")
  return titleCase(words.replace(/[,:;-]+$/, ""))
}

function cleanLine(line: string): string {
  let l = line.trim().replace(/^[-*•\d.)\s]+/, "")
  if (!l) return ""
  // Light normalization of common shorthand.
  l = l
    .replace(/\bw\//gi, "with ")
    .replace(/\bb\/c\b/gi, "because")
    .replace(/\s+/g, " ")
    .replace(/\bi\b/g, "I")
  return titleCase(l)
}

/**
 * Turn a rough, messy note into a clean, structured log entry.
 */
export async function formatNote(raw: string): Promise<FormattedEntry> {
  await fakeLatency()
  const trimmed = raw.trim()
  const lines = trimmed
    .split(/\n+/)
    .flatMap((l) => l.split(/(?<=[.!?])\s+(?=[A-Z0-9])/))
    .map(cleanLine)
    .filter(Boolean)

  const title = makeTitle(trimmed)
  const bodyPoints = lines.length > 1 ? lines : [titleCase(trimmed.replace(/\s+/g, " "))]
  const body = bodyPoints.map((p) => `- ${p.replace(/\.$/, "")}`).join("\n")

  return {
    title: title || "Untitled entry",
    body,
    tags: deriveTags(trimmed),
    type: deriveType(trimmed),
  }
}

export interface AgentAnswer {
  content: string
  citedEntryIds: string[]
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
}

/**
 * Naive keyword retrieval + templated answer over the project's log entries.
 * Stands in for a RAG pipeline (embeddings + vector search + generation).
 */
export async function answerQuestion(
  question: string,
  entries: LogEntry[],
): Promise<AgentAnswer> {
  await fakeLatency()

  if (entries.length === 0) {
    return {
      content:
        "There aren't any log entries for this project yet. Add a few notes and I'll be able to answer questions and pull up the relevant entries.",
      citedEntryIds: [],
    }
  }

  const qTokens = new Set(tokenize(question))
  const scored = entries
    .map((entry) => {
      const haystack = tokenize(`${entry.title} ${entry.body} ${entry.tags.join(" ")}`)
      let score = 0
      for (const token of haystack) {
        if (qTokens.has(token)) score += 1
      }
      // Light recency boost so ties favor newer entries.
      return { entry, score }
    })
    .sort((a, b) => b.score - a.score || b.entry.createdAt - a.entry.createdAt)

  const hasMatches = scored.some((s) => s.score > 0)
  const top = (hasMatches ? scored.filter((s) => s.score > 0) : scored).slice(0, 3)

  const citedEntryIds = top.map((s) => s.entry.id)
  const dates = top.map((s) =>
    new Date(s.entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  )

  const intro = hasMatches
    ? `Based on your log, here's what I found relevant to that:`
    : `I couldn't find a close match, but here are the most recent entries that might help:`

  const summary = top
    .map((s, i) => `- **${s.entry.title}** (${dates[i]}) — ${firstPoint(s.entry.body)}`)
    .join("\n")

  return {
    content: `${intro}\n\n${summary}\n\nI've linked the full entries below so you can review them.`,
    citedEntryIds,
  }
}

function firstPoint(body: string): string {
  const first = body.split(/\n+/)[0] ?? ""
  return first.replace(/^[-*•\s]+/, "").trim()
}

function fakeLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 450 + Math.random() * 500))
}
