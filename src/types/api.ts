export interface ApiEnvelope<T> {
  status: number
  success: boolean
  message: string
  content: T
}

export interface ApiEnvelopeNoContent {
  status: number
  success: boolean
  message: string
}
