import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("node_modules");
const removableExtensions = new Set([".d.ts", ".map"]);

async function prune(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await prune(entryPath);
      continue;
    }

    const extension = entry.name.endsWith(".d.ts") ? ".d.ts" : path.extname(entry.name);
    if (removableExtensions.has(extension)) {
      await unlink(entryPath);
    }
  }
}

await stat(root);
await prune(root);
