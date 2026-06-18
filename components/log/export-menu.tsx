"use client"

import { Copy, Download, FileCode, FileJson, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buildExport, downloadText, extensionFor, slugify, type ExportFormat } from "@/lib/export"
import type { LogEntry, Project } from "@/lib/types"

interface ExportMenuProps {
  project: Project
  entries: LogEntry[]
}

export function ExportMenu({ project, entries }: ExportMenuProps) {
  const disabled = entries.length === 0

  const handleDownload = (format: ExportFormat) => {
    const content = buildExport(project, entries, format)
    downloadText(`${slugify(project.name)}.${extensionFor(format)}`, content)
    toast.success(`Exported log as ${format}.`)
  }

  const handleCopy = async () => {
    const content = buildExport(project, entries, "markdown")
    try {
      await navigator.clipboard.writeText(content)
      toast.success("Log copied to clipboard as Markdown.")
    } catch {
      toast.error("Couldn't copy to clipboard.")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" disabled={disabled} />}
      >
        <Download data-icon="inline-start" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Download log</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleDownload("markdown")}>
            <FileCode data-icon="inline-start" />
            Markdown (.md)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("json")}>
            <FileJson data-icon="inline-start" />
            JSON (.json)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("text")}>
            <FileText data-icon="inline-start" />
            Plain text (.txt)
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          <Copy data-icon="inline-start" />
          Copy as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
