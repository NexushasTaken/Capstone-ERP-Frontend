import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const backendUrl = process.env.BACKEND_API_URL

// Endpoints the browser may call before it has an AccessToken cookie.
const PUBLIC_PATHS = new Set(['User/Login'])

/**
 * Forwards a request from the browser to the backend API at the same path.
 * The browser can't send the AccessToken cookie to the backend directly, so it
 * calls `/api/<path>` on this Next.js server, which attaches the cookie for it.
 */
export async function proxyToBackend(request: NextRequest, path: string, search = request.nextUrl.search) {
  if (!backendUrl) {
    return Response.json(
      { message: 'The backend API URL has not been configured.' },
      { status: 500 },
    )
  }

  const headers = new Headers()

  if (!PUBLIC_PATHS.has(path)) {
    const accessToken = (await cookies()).get('AccessToken')?.value

    if (!accessToken) {
      return Response.json(
        { message: 'No access token found in cookies.' },
        { status: 401 },
      )
    }

    headers.set('Cookie', `AccessToken=${accessToken}`)
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const body = hasBody ? await request.text() : undefined

  if (body) {
    headers.set('Content-Type', request.headers.get('content-type') ?? 'application/json')
  }

  try {
    const upstream = await fetch(`${backendUrl}/api/${path}${search}`, {
      method: request.method,
      headers,
      body: body || undefined,
      cache: 'no-store',
    })

    const responseHeaders = new Headers({
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    })
    // Login and Logout set or clear the AccessToken cookie.
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append('Set-Cookie', cookie)
    }

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch {
    return Response.json(
      { message: 'Unable to reach the backend service.' },
      { status: 502 },
    )
  }
}
