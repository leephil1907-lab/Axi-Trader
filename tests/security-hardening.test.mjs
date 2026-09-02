import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("server secrets are not exposed through next.config.js", () => {
  const config = read("next.config.js");
  assert.doesNotMatch(config, /env\s*:\s*\{/);
  assert.doesNotMatch(config, /DATABASE_URL/);
  assert.doesNotMatch(config, /JWT_SECRET/);
});

test("JWT auth fails closed when no real secret is configured", () => {
  const auth = read("src/lib/auth.ts");
  assert.match(auth, /JWT_SECRET must be configured/);
  assert.doesNotMatch(auth, /axi-trader-default-secret/);
});

test("money movement locks the user row before changing balance", () => {
  const source = read("src/lib/complete-transaction.ts");
  assert.match(source, /FOR UPDATE/);
  assert.match(source, /tx\.user\.update/);
  assert.match(source, /writeAuditLog/);
});

test("admin transaction actions use database-backed admin authorization", () => {
  const source = read("src/app/api/admin/transactions/route.ts");
  assert.match(source, /requireAdmin/);
  assert.match(source, /rateLimit/);
  assert.match(source, /writeAuditLog/);
});

test("admin KYC actions use database-backed admin authorization", () => {
  const source = read("src/app/api/admin/kyc/route.ts");
  assert.match(source, /requireAdmin/);
  assert.match(source, /writeAuditLog/);
});

test("security migration creates shared audit and rate-limit tables", () => {
  const sql = read("prisma/migrations/20260902233000_security_hardening/migration.sql");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS \"AuditLog\"/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS \"RateLimitBucket\"/);
  assert.match(sql, /AuditLog_actorUserId_fkey/);
});
