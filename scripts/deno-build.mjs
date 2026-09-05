// Deno Deploy build entrypoint: generate Prisma client -> push schema to
// Postgres -> Next.js production build. Fails with an actionable message
// instead of a bare exit code when the database URL is missing/unreachable.
import { execSync } from "child_process";

function run(cmd, label) {
  console.log(`\n### ${label}\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

const url = (process.env.DATABASE_URL || "").trim();

run("npx prisma generate", "1/3 prisma generate");

console.log("\n### 2/3 prisma db push");
if (!url) {
  console.error(
    "\nBUILD FAILED: DATABASE_URL is not set.\n" +
      "Set it in dash.deno.com -> your project -> Settings -> Environment Variables,\n" +
      "using the POOLED Postgres connection string (Neon, Supabase, Railway or\n" +
      "Prisma Postgres), e.g. postgresql://user:password@host:5432/axi_trader?schema=public\n" +
      "Then press Retry Build.\n"
  );
  process.exit(1);
}
if (!/^postgres(ql)?:\/\//.test(url)) {
  console.error(
    `\nBUILD FAILED: DATABASE_URL must be a Postgres URL in production (got scheme "${url.split(":")[0]}").\n` +
      "SQLite only works for local preview; Deno's filesystem is ephemeral.\n" +
      "Provision hosted Postgres and set its pooled URL, then Retry Build.\n"
  );
  process.exit(1);
}
const direct = (process.env.DIRECT_URL || "").trim();
if (!direct) {
  console.error(
    "\nBUILD FAILED: DIRECT_URL is not set.\n" +
      "Set it in dash.deno.com -> your project -> Settings -> Environment Variables,\n" +
      "using the DIRECT (non-pooled, port 5432) Postgres connection string from\n" +
      "Supabase -> Project Settings -> Database -> Connection string (URI, pooling OFF).\n" +
      "DATABASE_URL stays the pooled one (port 6543) for the running app; DIRECT_URL\n" +
      "is used only to create the tables during the build. Then press Retry Build.\n"
  );
  process.exit(1);
}
try {
  run("npx prisma db push", "pushing schema to Postgres");
} catch {
  console.error(
    "\nBUILD FAILED: could not reach Postgres with DATABASE_URL.\n" +
      "Checklist: (1) pooled (not direct) connection string, (2) password/username\n" +
      "URL-encoded if they contain special characters, (3) provider allows Deno's\n" +
      "outbound connections (Neon/Supabase allow all IPs by default; add ?sslmode=require\n" +
      "if your provider demands TLS), (4) database exists. Fix it, then Retry Build.\n"
  );
  process.exit(1);
}

run("npm run build", "3/3 next build");
console.log("\nDeno build completed successfully.");
