import { NextRequest } from 'next/server'

const backendUrl = process.env.BACKEND_API_URL

export async function POST(request: NextRequest) {
  if (!backendUrl) {
    return Response.json(
      { message: 'The backend API URL has not been configured.' },
      { status: 500 },
    )
  }

  const body = await request.text()

  try {
    const upstream = await fetch(`${backendUrl.replace(/\/$/, '')}/api/User/Login`, {
      method: 'POST',
      headers: { 'Content-Type': request.headers.get('content-type') ?? 'application/json' },
      body,
      cache: 'no-store',
    })

    const headers = new Headers()
    const contentType = upstream.headers.get('content-type')
    if (contentType) headers.set('content-type', contentType)

    // Forward the JWT cookie that the .NET API returns to the browser.
    for (const cookie of upstream.headers.getSetCookie()) {
      headers.append('set-cookie', cookie)
    }

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers,
    })
  } catch {
    return Response.json(
      { message: 'Unable to reach the authentication service.' },
      { status: 502 },
    )
  }
}
