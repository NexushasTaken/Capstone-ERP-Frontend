import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_API_URL;

export async function GET() {
  // const cookieStore = await cookies();
  // const accessToken = cookieStore.get("AccessToken")?.value;

  // No need to check accessToken in front end.
  // if (!accessToken) {
  //   return NextResponse.json(
  //     { message: 'No access token found in cookies.' },
  //     { status: 401 },
  //   );
  // }

  if (!backendUrl) {
    return NextResponse.json(
      { message: "The backend API URL has not been configured." },
      { status: 500 },
    );
  }

  try {
    const upstream = await fetch(`${backendUrl}/api/View/authorize`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }
}
