import Papa from "papaparse"
import { readSheet } from "read-excel-file/browser"

/** One data row, keyed by normalized header (see normalizeHeader). */
export type SheetRow = Record<string, string>

// "Reorder Point", "reorder_point" and "reorderPoint" all become "reorderpoint".
export function normalizeHeader(header: string) {
  return header
    .replace(/^﻿/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
}

function cellText(cell: unknown) {
  if (cell === null || cell === undefined) return ""
  if (cell instanceof Date) return cell.toISOString()
  return String(cell).trim()
}

// First row is the header; fully empty rows are dropped.
function toRows(table: unknown[][]): SheetRow[] {
  const [header = [], ...body] = table
  const keys = header.map((cell) => normalizeHeader(cellText(cell)))

  return body
    .map((cells) => Object.fromEntries(keys.map((key, i) => [key, cellText(cells[i])])))
    .filter((row) => Object.values(row).some((value) => value !== ""))
}

async function readCsv(file: File) {
  const result = Papa.parse<unknown[]>(await file.text(), { skipEmptyLines: "greedy" })
  return result.data
}

/** Reads the first sheet of a .csv or .xlsx file into rows keyed by normalized header. */
export async function parseSheet(file: File): Promise<SheetRow[]> {
  const name = file.name.toLowerCase()

  if (name.endsWith(".csv")) return toRows(await readCsv(file))
  if (name.endsWith(".xlsx")) return toRows(await readSheet(file))

  throw new Error("Choose a .csv or .xlsx file.")
}
