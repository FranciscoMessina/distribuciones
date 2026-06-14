import { mkdir, readdir } from "node:fs/promises"
import { extname, join, relative, resolve } from "node:path"

const rootDirectory = resolve(import.meta.dir, "..")
const distDirectory = join(rootDirectory, "dist")
const outputFile = join(
  rootDirectory,
  "standalone",
  "generated-assets.ts"
)

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? listFiles(path) : [path]
    })
  )

  return files.flat()
}

const files = await listFiles(distDirectory)
const assets = Object.fromEntries(
  await Promise.all(
    files.map(async (file) => {
      const pathname = `/${relative(distDirectory, file).replaceAll("\\", "/")}`
      const contents = Buffer.from(await Bun.file(file).arrayBuffer()).toString(
        "base64"
      )
      return [pathname, { contents, extension: extname(file).toLowerCase() }]
    })
  )
)

await mkdir(join(rootDirectory, "standalone"), { recursive: true })
await Bun.write(
  outputFile,
  `export const embeddedAssets = ${JSON.stringify(assets)} as const\n`
)

console.log(`Embedded ${files.length} files from dist.`)
