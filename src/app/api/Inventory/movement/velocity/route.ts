import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/server/backendProxy'

// Validates the query before forwarding: the backend doesn't reject zero/negative paging.
export async function GET(request: NextRequest) {
  const cutOffDate = request.nextUrl.searchParams.get('cutOffDate')
  if (!cutOffDate || !Number.isSafeInteger(Number(cutOffDate))) {
    return Response.json({ message: 'cutOffDate must be an integer.' }, { status: 400 })
  }
  const query = new URLSearchParams({ cutOffDate })
  for (const key of ['page', 'pageSize']) {
    const value = request.nextUrl.searchParams.get(key)
    if (value !== null) {
      if (!Number.isSafeInteger(Number(value)) || Number(value) < 1) {
        return Response.json({ message: `${key} must be a positive integer.` }, { status: 400 })
      }
      query.set(key, value)
    }
  }

  return proxyToBackend(request, 'Inventory/movement/velocity', `?${query}`)
}
