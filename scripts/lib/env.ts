import { readFileSync } from "fs";
import path from "path";

// tsx scripts don't get Next.js's automatic env loading; read .env.local/.env ourselves.
for (const file of [".env.local", ".env"]) {
  try {
    const content = readFileSync(path.join(process.cwd(), file), "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // file absent — fine
  }
}
