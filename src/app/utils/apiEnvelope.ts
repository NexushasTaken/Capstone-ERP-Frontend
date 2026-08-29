export interface ApiEnvelope<T> {
  status: number
  success: boolean
  message: string
  content: T
}