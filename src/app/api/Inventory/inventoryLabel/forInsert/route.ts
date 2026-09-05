
import { cookies } from 'next/headers'

const backendUrl = process.env.BACKEND_API_URL

export async function GET() {
  if (!backendUrl) {
    return Response.json(
      { message: 'The backend API URL has not been configured.' },
      { status: 500 },
    )
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('AccessToken')?.value

  if (!accessToken) {
    return Response.json(
      { message: 'No access token found in cookies.' },
      { status: 401 },
    )
  }

  const search = ''

  try {
    const upstream = await fetch(`${backendUrl}/api/Inventory/inventoryLabel/forInsert${search}`, {
      method: 'GET',
      headers: { Cookie: `AccessToken=${accessToken}` },
      cache: 'no-store',
    })

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      },
    })
  } catch {
    return Response.json(
      { message: 'Unable to reach the inventory service.' },
      { status: 502 },
    )
  }
}