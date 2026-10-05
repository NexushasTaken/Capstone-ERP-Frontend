export interface ApiEnvelope<T> {
  status: number
  success: boolean
  message: string
  /** Present on a 400: rejected fields and their messages. */
  errors?: Record<string, string[]>
  content: T
}

export interface ApiEnvelopeNoContent {
  status: number
  success: boolean
  message: string
  /** Present on a 400: rejected fields and their messages. */
  errors?: Record<string, string[]>
}
