"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

/** Runs one of the report download functions (they build the PDF on the backend and save it). */
export function useReportDownload() {
  return useMutation({
    mutationFn: (download: () => Promise<void>) => download(),
    onError: (error) => toast.error(error.message || "Failed to export the report"),
  })
}
