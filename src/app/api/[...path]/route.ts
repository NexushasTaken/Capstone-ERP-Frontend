import { NextRequest } from "next/server"
import { proxyToBackend } from "@/lib/server/backendProxy"

// Forwards every /api/* request to the backend's matching /api/* endpoint.
async function handler(request: NextRequest, ctx: RouteContext<"/api/[...path]">) {
  const { path } = await ctx.params
  return proxyToBackend(request, path.join("/"))
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE }
