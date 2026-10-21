import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The release package runs .next/standalone/server.js with plain Node, no node_modules.
  output: 'standalone',
  // Image optimisation needs sharp, a native module; a Linux-built package can't load it on Windows.
  images: { unoptimized: true },
  allowedDevOrigins: ['*.*.*.*'],
}

export default nextConfig
