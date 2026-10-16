import { z } from "zod"

// Zod rules for spreadsheet cells, which always arrive as strings ("" when blank).

const blankToUndefined = (value: unknown) => (value === "" ? undefined : value)

/** Required text; surrounding spaces are trimmed. */
export const textCell = (message: string) => z.string().trim().min(1, message)

/** Optional text; a blank cell becomes undefined. */
export const optionalTextCell = () => z.preprocess(blankToUndefined, z.string().trim().optional())

/** A number above 0. Blank or non-numeric text fails with `message`. */
export const positiveNumberCell = (message: string) =>
  z.preprocess(blankToUndefined, z.coerce.number({ error: message }).gt(0, message))

/** An optional whole number above 0; a blank cell becomes undefined. */
export const optionalPositiveIntCell = (message: string) =>
  z.preprocess(blankToUndefined, z.coerce.number({ error: message }).int(message).gt(0, message).optional())
