import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_API_URL;

export async function POST() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("AccessToken")?.value;

    if (!accessToken) {
        return NextResponse.json(
            { message: 'No access token found in cookies.' },
            { status: 401 },
        );
    }

    if (!backendUrl) {
    return Response.json(
      { message: 'The backend API URL has not been configured.' },
      { status: 500 },
    )
    }

    try {
        const upstream = await fetch(`${backendUrl}/api/User/Logout`, {
            method: 'POST',
            headers: { 'Cookie': `AccessToken=${accessToken}`},
            cache: 'no-store',
        })

        //console.log(upstream)
        const headers = new Headers()
        const contentType = upstream.headers.get('content-type')
        const setCookies = upstream.headers.get('set-cookie')
        
        if (setCookies) headers.set('set-cookie', setCookies)
        if (contentType) headers.set('content-type', contentType)

        return new Response(await upstream.text(), {
            status: upstream.status,
            headers,
        })
    } catch {
        return Response.json(
        { message: "Unable to reach the authentication service." },
        { status: 502 }
        );
    }
}