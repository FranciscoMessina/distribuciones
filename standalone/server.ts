import { embeddedAssets } from "./generated-assets"

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

type AssetPath = keyof typeof embeddedAssets

const decodedAssets = new Map<AssetPath, Uint8Array>()

function getAsset(pathname: AssetPath) {
  const cached = decodedAssets.get(pathname)
  if (cached) return cached

  const bytes = Uint8Array.from(
    atob(embeddedAssets[pathname].contents),
    (character) => character.charCodeAt(0)
  )
  decodedAssets.set(pathname, bytes)
  return bytes
}

function openBrowser(url: string) {
  const command =
    process.platform === "win32"
      ? ["cmd", "/c", "start", "", url]
      : process.platform === "darwin"
        ? ["open", url]
        : ["xdg-open", url]

  try {
    Bun.spawn(command, {
      stdout: "ignore",
      stderr: "ignore",
    })
  } catch {
    // Headless and minimal systems may not provide a browser opener.
  }
}

const hostname = "127.0.0.1"
const preferredPort = Number(process.env.PORT ?? 4173)

const fetch = (request: Request) => {
  const url = new URL(request.url)
  let pathname: string

  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    return new Response("Bad request", { status: 400 })
  }

  const requestedAsset = embeddedAssets[pathname as AssetPath]
  const acceptsHtml = request.headers.get("accept")?.includes("text/html")
  const assetPath = requestedAsset
    ? (pathname as AssetPath)
    : pathname === "/" || acceptsHtml
      ? ("/index.html" as AssetPath)
      : undefined

  if (!assetPath) {
    return new Response("Not found", { status: 404 })
  }

  const asset = embeddedAssets[assetPath]
  const headers = new Headers({
    "Content-Type": contentTypes[asset.extension] ?? "application/octet-stream",
  })

  if (assetPath === "/sw.js" || assetPath === "/manifest.webmanifest") {
    headers.set("Cache-Control", "no-cache")
  } else if (assetPath.startsWith("/assets/")) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable")
  }

  return new Response(request.method === "HEAD" ? null : getAsset(assetPath), {
    headers,
  })
}

function startServer() {
  const ports = process.env.PORT
    ? [preferredPort]
    : Array.from({ length: 10 }, (_, index) => preferredPort + index)

  for (const port of ports) {
    try {
      return Bun.serve({ hostname, port, fetch })
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "EADDRINUSE"
      ) {
        continue
      }
      throw error
    }
  }

  return Bun.serve({ hostname, port: 0, fetch })
}

const server = startServer()
const url = server.url.toString()
console.log(`Distribuciones is running at ${url}`)
openBrowser(url)
