import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  deriveExpectedRows,
  parseMatrix,
  renderExpectedMarkdown,
  validateMatrix,
} from "./verify-phase8-acceptance.mjs";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const sourceRoot = path.join(repoRoot, ".planning");
const schemaPath = path.join(repoRoot, "docs/evidence/phase8/schemas/acceptance-matrix.schema.json");
const allowedStates = JSON.parse(fs.readFileSync(schemaPath, "utf8")).properties.state.enum;

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "phase8-acceptance-"));
}

function completeRows() {
  return deriveExpectedRows({ sourceRoot }).map((row) => ({
    ...row,
    state: "blocked_external",
    owner: "phase8-owner",
    evidence: `EVID-${row.id}`,
    notes: row.title,
  }));
}

function markdownFor(rows) {
  return [
    "| ID | Type | State | Owner | Evidence | Notes |",
    "|---|---|---|---|---|---|",
    ...rows.map((row) => `| ${row.id} | ${row.type} | ${row.state} | ${row.owner} | ${row.evidence} | ${(row.notes || "").replace(/\|/g, "/")} |`),
  ].join("\n");
}

function runVerifier(markdown) {
  const tempDir = makeTempDir();
  const matrixPath = path.join(tempDir, "matrix.md");
  fs.writeFileSync(matrixPath, markdown);
  return validateMatrix({
    rows: parseMatrix(fs.readFileSync(matrixPath, "utf8")),
    expectedRows: deriveExpectedRows({ sourceRoot }),
    allowedStates,
  });
}

test("complete matrix passes", () => {
  const result = runVerifier(markdownFor(completeRows()));
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.rowCount, result.expectedCount);
});

test("expected matrix can be rendered from authoritative Phase 2-7 and audit sources", () => {
  const expected = deriveExpectedRows({ sourceRoot });
  const output = renderExpectedMarkdown(expected);
  assert.match(output, /\| P02-01 \| phase_acceptance \|/);
  assert.match(output, /\| C-01 \| audit_finding \|/);
  assert.match(output, /\| H-13 \| audit_finding \|/);
});

test("missing row is rejected", () => {
  const rows = completeRows().filter((row) => row.id !== "C-01");
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /C-01: missing required row/);
});

test("duplicate row is rejected", () => {
  const rows = completeRows();
  rows.push({ ...rows[0] });
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), new RegExp(`${rows[0].id}: duplicate row`));
});

test("unknown row is rejected", () => {
  const rows = completeRows();
  rows.push({
    id: "X-99",
    type: "audit_finding",
    state: "missing",
    owner: "phase8-owner",
    evidence: "EVID-X-99",
    notes: "unknown",
  });
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /unknown row ID X-99/);
});

test("unknown state is rejected", () => {
  const rows = completeRows();
  rows[0].state = "done";
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), new RegExp(`${rows[0].id}: invalid state`));
});

test("empty evidence is rejected", () => {
  const rows = completeRows();
  rows[0].evidence = "";
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), new RegExp(`${rows[0].id}: evidence is required`));
});

test("empty owner is rejected", () => {
  const rows = completeRows();
  rows[0].owner = "";
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), new RegExp(`${rows[0].id}: owner is required`));
});

test("token-shaped evidence is rejected without echoing the value", () => {
  const secret = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";
  const rows = completeRows();
  rows[0].evidence = secret;
  const result = runVerifier(markdownFor(rows));
  const errors = result.errors.join("\n");
  assert.equal(result.ok, false);
  assert.match(errors, /credential-like value detected/);
  assert.doesNotMatch(errors, new RegExp(secret));
});

test("private-key-shaped evidence is rejected", () => {
  const rows = completeRows();
  rows[0].evidence = "-----BEGIN PRIVATE KEY----- redacted -----END PRIVATE KEY-----";
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /private-key/);
});

test("URI credentials are rejected", () => {
  const rows = completeRows();
  rows[0].evidence = "mongodb+srv://user:pass@example.invalid/db";
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /uri-credential|mongodb-uri/);
});

test("high entropy candidates are rejected", () => {
  const rows = completeRows();
  rows[0].evidence = "A9fGh7Kp2LmN8QrT4vWxYzB6cDeFjH3kLpQsRtUv";
  const result = runVerifier(markdownFor(rows));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /high-entropy-candidate/);
});
