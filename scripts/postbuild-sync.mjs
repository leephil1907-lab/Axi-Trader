// Copies static assets into the Next.js standalone output.
// Runs as `postbuild` locally (real Node) and on Deno Deploy (Node shim),
// so it must live in a file: `node -e "<inline code>"` is not supported by
// the Deno shim (it treats the code string as a file path and fails).
import fs from "node:fs";

for (const [from, to] of [
  ["public", ".next/standalone/public"],
  [".next/static", ".next/standalone/.next/static"],
]) {
  try {
    fs.rmSync(to, { recursive: true, force: true });
    fs.cpSync(from, to, { recursive: true });
    console.log(`standalone asset synced: ${from} -> ${to}`);
  } catch (e) {
    console.warn(`postbuild sync skipped for ${from}: ${e.message}`);
  }
}
console.log("standalone assets synced");
