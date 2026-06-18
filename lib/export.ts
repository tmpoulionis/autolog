import type { LogEntry, Project } from "./types"

export type ExportFormat = "markdown" | "json" | "text"

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Entries are expected newest-first; exports render oldest-first chronologically. */
export function buildExport(project: Project, entries: LogEntry[], format: ExportFormat): string {
  const ordered = [...entries].sort((a, b) => a.createdAt - b.createdAt)

  if (format === "json") {
    return JSON.stringify(
      {
        project: { name: project.name, description: project.description, createdAt: project.createdAt },
        entries: ordered,
        exportedAt: Date.now(),
      },
      null,
      2,
    )
  }

  if (format === "text") {
    const header = `${project.name}\n${"=".repeat(project.name.length)}\n${project.description}\n`
    const body = ordered
      .map((e) => {
        const tags = e.tags.length ? `[${e.tags.join(", ")}]` : ""
        const points = e.body
          .split("\n")
          .map((l) => l.replace(/^[-*]\s+/, "  - ").replace(/\*\*/g, ""))
          .join("\n")
        return `${formatDate(e.createdAt)} ${tags}\n${e.title}\n${points}`
      })
      .join("\n\n")
    return `${header}\n${body}\n`
  }

  // markdown
  const header = `# ${project.name}\n\n${project.description}\n`
  const body = ordered
    .map((e) => {
      const tags = e.tags.length ? `\n\n${e.tags.map((t) => `\`${t}\``).join(" ")}` : ""
      return `## ${e.title}\n\n*${formatDate(e.createdAt)}*\n\n${e.body}${tags}`
    })
    .join("\n\n---\n\n")
  return `${header}\n${body}\n`
}

export function extensionFor(format: ExportFormat): string {
  return format === "markdown" ? "md" : format === "json" ? "json" : "txt"
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project"
}
