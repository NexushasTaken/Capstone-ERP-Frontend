"use client"

import { useRef, useState, type ReactNode } from "react"
import { CircleAlert, Download, Upload } from "lucide-react"
import type { z } from "zod"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import DataTable from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { isValidationError } from "@/lib/apiError"
import { downloadTemplate } from "@/lib/import/downloadTemplate"
import { normalizeHeader, parseSheet } from "@/lib/import/parseSheet"
import { cn } from "@/lib/utils"

export interface ImportColumn<T> {
  /** Field name in the request row; server errors come back as `rows.N.<key>`. */
  key: keyof T & string
  /** Template header. A file header matches it (or `key`) ignoring case, spaces, `_` and `-`. */
  label: string
  required?: boolean
}

interface ImportModalProps<T> {
  title: string
  columns: ImportColumn<T>[]
  /** Checks one row of cell text and turns it into the request row. */
  schema: z.ZodType<T>
  templateName: string
  /** Shown under the file picker, e.g. what a blank cell means. */
  hint?: string
  pending: boolean
  /**
   * Checks the rows against the server's data (existing names, unknown categories) right after a file is picked,
   * without saving. Gets every row's cell text in file order; rejects with an ApiError carrying `rows.N.<key>` errors.
   */
  onCheck?: (cells: Record<string, string>[]) => Promise<unknown>
  /** Rejects with an ApiError on a 400 so row errors can be shown. */
  onImport: (rows: T[]) => Promise<unknown>
  onClose: () => void
}

interface PreviewRow<T> {
  cells: Record<string, string>
  data?: T
  /** First message per column key. */
  errors: Record<string, string>
}

const ROW_ERRORS = /^rows\.(\d+)\.(.+)$/

// Pick a .csv/.xlsx file, preview it with an error on each bad row, then import every row at once.
// Nothing is sent while any row has an error; the server also saves all rows or none.
export default function ImportModal<T>({
  title,
  columns,
  schema,
  templateName,
  hint,
  pending,
  onCheck,
  onImport,
  onClose,
}: ImportModalProps<T>) {
  const [rows, setRows] = useState<PreviewRow<T>[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  // The server check couldn't run (server down, logged out...), so the file isn't known to be valid.
  const [checkFailed, setCheckFailed] = useState(false)
  // Bumped on every pick, so a slow check for an older file can't overwrite the newer one.
  const pickId = useRef(0)

  const invalidCount = rows.filter((row) => Object.keys(row.errors).length > 0).length
  const columnLabel = (key: string) => columns.find((column) => column.key === key)?.label
  // Every error in row order, for the list under the table (tooltips are hover-only, so this also serves touch).
  const problems = rows.flatMap((row, i) =>
    Object.entries(row.errors).map(([key, message]) => ({ row: i + 1, key, label: columnLabel(key), message })),
  )

  // Put each "rows.N.field" message on its row; anything else is about the whole file.
  function mergeServerErrors(fieldErrors: Record<string, string>, fallback: string) {
    const byRow = new Map<number, Record<string, string>>()
    const other: string[] = []
    for (const [field, message] of Object.entries(fieldErrors)) {
      const match = ROW_ERRORS.exec(field)
      if (match) {
        const index = Number(match[1])
        byRow.set(index, { ...byRow.get(index), [match[2]]: message })
      } else {
        other.push(message)
      }
    }
    setRows((current) =>
      current.map((row, i) => (byRow.has(i) ? { ...row, errors: { ...row.errors, ...byRow.get(i) } } : row)),
    )
    setFileError(other.length > 0 ? other.join(" ") : byRow.size === 0 ? fallback : null)
  }

  async function handleFile(file: File | undefined) {
    const id = ++pickId.current
    setRows([])
    setFileName(file?.name ?? null)
    setFileError(null)
    setCheckFailed(false)
    setChecking(false)
    if (!file) return

    let parsed: PreviewRow<T>[]
    try {
      const sheet = await parseSheet(file)
      if (id !== pickId.current) return
      if (sheet.length === 0) {
        setFileError("The file has no rows to import.")
        return
      }

      const headerOf = (column: ImportColumn<T>) =>
        [normalizeHeader(column.label), normalizeHeader(column.key)].find((header) => header in sheet[0])
      const missing = columns.filter((column) => column.required && !headerOf(column)).map((column) => column.label)
      if (missing.length > 0) {
        setFileError(`Missing column: ${missing.join(", ")}. Download the template to see the expected headers.`)
        return
      }

      parsed = sheet.map((raw) => {
        const cells = Object.fromEntries(
          columns.map((column) => {
            const header = headerOf(column)
            return [column.key, header ? raw[header] : ""]
          }),
        )
        const result = schema.safeParse(cells)
        const errors: Record<string, string> = {}
        if (!result.success) {
          for (const issue of result.error.issues) {
            const key = String(issue.path[0] ?? "")
            errors[key] ??= issue.message
          }
        }
        return { cells, data: result.success ? result.data : undefined, errors }
      })
      setRows(parsed)
    } catch (err) {
      if (id === pickId.current) setFileError(err instanceof Error ? err.message : "Could not read the file.")
      return
    }

    if (!onCheck) return

    setChecking(true)
    try {
      await onCheck(parsed.map((row) => row.cells))
    } catch (err) {
      if (id !== pickId.current) return
      if (isValidationError(err)) {
        mergeServerErrors(err.fieldErrors, err.message)
      } else {
        setCheckFailed(true)
        setFileError(err instanceof Error ? err.message : "Couldn't check the file with the server.")
      }
    } finally {
      if (id === pickId.current) setChecking(false)
    }
  }

  async function handleImport() {
    try {
      await onImport(rows.map((row) => row.data as T))
      onClose()
    } catch (err) {
      if (isValidationError(err)) {
        // Normally caught by the check on pick; this covers data that changed since then.
        mergeServerErrors(err.fieldErrors, err.message)
      } else {
        // postImport always gives a readable message; keep it beside the preview after the toast fades.
        setFileError(err instanceof Error ? err.message : "Couldn't import the file. Nothing was saved.")
      }
    }
  }

  return (
    <AppModal open onClose={onClose} className="lg:max-w-4xl">
      <ModalHeader title={title} onClose={onClose} />
      <ModalBody>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            type="file"
            accept=".csv,.xlsx"
            aria-label="Spreadsheet file"
            onChange={(event) => {
              handleFile(event.target.files?.[0])
              // Cleared so picking the same file again (after fixing it) runs the checks again.
              event.target.value = ""
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              downloadTemplate(
                templateName,
                columns.map((column) => column.label),
              )
            }
          >
            <Download className="h-4 w-4" />
            Template
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          A .csv or .xlsx file with a header row. Columns:{" "}
          {columns.map((column) => `${column.label}${column.required ? "" : " (optional)"}`).join(", ")}.
          {hint ? ` ${hint}` : ""}
        </p>

        {fileError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{fileError}</p>}

        {rows.length > 0 && (
          <p className="text-sm">
            <span className="font-medium">{fileName}</span>: {rows.length} row(s) found
            {checking ? (
              <span className="text-muted-foreground">, checking with the server...</span>
            ) : checkFailed ? (
              <span className="text-destructive">, couldn&apos;t be checked. Pick the file again to retry.</span>
            ) : invalidCount > 0 ? (
              <span className="text-destructive">
                , {invalidCount} with problems. Fix them in the file and pick it again.
              </span>
            ) : (
              <span className="text-green-700">, all ready to import.</span>
            )}
          </p>
        )}

        {/* Fixed height so the modal doesn't jump; the table scrolls inside with its header pinned. */}
        <div className="h-72 overflow-auto rounded-lg border">
          {rows.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Pick a file to preview its rows.
            </p>
          ) : (
            <DataTable
              columns={["#", ...columns.map((column) => column.label)]}
              isLoading={false}
              error={null}
              isEmpty={false}
              errorMessage=""
              emptyMessage=""
            >
              {rows.map((row, i) => {
                // Errors on fields that have no column of their own go on the row number.
                const rowOnly = Object.entries(row.errors)
                  .filter(([key]) => !columns.some((column) => column.key === key))
                  .map(([, message]) => message)
                const hasErrors = Object.keys(row.errors).length > 0
                return (
                  <TableRow key={i}>
                    <TableCell className={cn("px-3", hasErrors ? "text-destructive" : "text-muted-foreground")}>
                      <ErrorTip message={rowOnly.join(" ")}>{i + 1}</ErrorTip>
                    </TableCell>
                    {columns.map((column) => {
                      const message = row.errors[column.key]
                      const value = row.cells[column.key]
                      return (
                        <TableCell
                          key={column.key}
                          className={cn("px-3", message && "bg-destructive/10 text-destructive")}
                        >
                          <ErrorTip message={message}>
                            {value || (message ? <span className="italic opacity-70">(blank)</span> : null)}
                          </ErrorTip>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </DataTable>
          )}
        </div>

        {problems.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-destructive">Problems ({problems.length})</p>
            <ul className="max-h-40 overflow-auto rounded-lg bg-destructive/10 p-3 text-sm">
              {problems.map((problem) => (
                <li key={`${problem.row}-${problem.key}`} className="py-0.5">
                  <span className="font-medium">
                    Row {problem.row}
                    {problem.label ? ` · ${problem.label}` : ""}:
                  </span>{" "}
                  <span className="text-destructive">{problem.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleImport}
        confirmLabel={pending ? "Importing..." : rows.length > 0 ? `Import ${rows.length} row(s)` : "Import"}
        confirmIcon={Upload}
        confirmDisabled={rows.length === 0 || invalidCount > 0 || checking || checkFailed || pending}
      />
    </AppModal>
  )
}

// A bad cell's content with an alert icon; hovering or focusing it shows the message. Plain content when there's none.
function ErrorTip({ message, children }: { message?: string; children: ReactNode }) {
  if (!message) return <>{children}</>

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span tabIndex={0} />}
        className="inline-flex cursor-help items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {children}
        <span className="sr-only">: {message}</span>
      </TooltipTrigger>
      <TooltipContent className="rounded-md">{message}</TooltipContent>
    </Tooltip>
  )
}
