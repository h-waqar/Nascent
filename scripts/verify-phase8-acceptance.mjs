#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const DEFAULT_STATES = [
  "verified",
  "implemented_unverified",
  "missing",
  "superseded",
  "blocked_external",
];

const CRITICAL_HIGH_IDS = [
  "C-01",
  "C-02",
  ...Array.from({ length: 13 }, (_, index) => `H-${String(index + 1).padStart(2, "0")}`),
];

const SECRET_PATTERNS = [
  { name: "private-key", pattern: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/i },
  { name: "uri-credential", pattern: /[a-z][a-z0-9+.-]*:\/\/[^/\s:@|]+:[^/\s@|]+@/i },
  { name: "github-token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { name: "stripe-like-token", pattern: /\b[sp]k_(live|test)_[A-Za-z0-9]{16,}\b/ },
  { name: "mongodb-uri", pattern: /mongodb(\+srv)?:\/\//i },
  { name: "cloudinary-uri", pattern: /cloudinary:\/\//i },
  { name: "vercel-token", pattern: /\bvercel_[A-Za-z0-9]{20,}\b/i },
  { name: "aws-access-key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "google-api-key", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: "slack-token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: "jwt", pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/ },
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function normalizeCell(value) {
  return value.replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim();
}

function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(normalizeCell);
}

function isSeparatorRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export function derivePhaseCriteria({ sourceRoot = ".planning" } = {}) {
  const roadmapPath = path.join(sourceRoot, "ROADMAP.md");
  const roadmap = readText(roadmapPath);
  const rows = [];
  let currentPhase = null;
  const phaseCounts = new Map();

  for (const rawLine of roadmap.split(/\r?\n/)) {
    const heading = rawLine.match(/^#{2,3}\s+Phase\s+(\d+)\b/i);
    if (heading) {
      currentPhase = Number(heading[1]);
      continue;
    }

    if (currentPhase < 2 || currentPhase > 7) continue;
    const item = rawLine.match(/^\s*-\s+\[[ xX]\]\s+(.+?)\s*$/);
    if (!item) continue;

    const count = (phaseCounts.get(currentPhase) || 0) + 1;
    phaseCounts.set(currentPhase, count);
    rows.push({
      id: `P${String(currentPhase).padStart(2, "0")}-${String(count).padStart(2, "0")}`,
      type: "phase_acceptance",
      title: item[1].trim(),
    });
  }

  if (rows.length === 0) {
    throw new Error(`No Phase 2-7 acceptance criteria found in ${roadmapPath}`);
  }

  return rows;
}

export function deriveExpectedRows({ sourceRoot = ".planning" } = {}) {
  return [
    ...derivePhaseCriteria({ sourceRoot }),
    ...CRITICAL_HIGH_IDS.map((id) => ({
      id,
      type: "audit_finding",
      title: "Critical/High pre-production audit finding",
    })),
  ];
}

function parseJsonMatrix(text) {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.rows)) return parsed.rows;
  throw new Error("JSON matrix must be an array or contain a rows array");
}

export function parseMatrix(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseJsonMatrix(trimmed);
  }

  const lines = text.split(/\r?\n/);
  const rows = [];
  let header = null;

  for (const line of lines) {
    if (!line.includes("|")) continue;
    const cells = splitMarkdownRow(line);
    if (cells.length < 5 || isSeparatorRow(cells)) continue;

    const lowerCells = cells.map((cell) => cell.toLowerCase());
    if (!header && lowerCells.includes("id") && lowerCells.includes("state") && lowerCells.includes("owner") && lowerCells.includes("evidence")) {
      header = lowerCells;
      continue;
    }

    if (!header) continue;
    const record = {};
    header.forEach((name, index) => {
      record[name] = cells[index] || "";
    });
    rows.push(record);
  }

  if (!header) {
    throw new Error("Matrix must include a Markdown table header containing ID, State, Owner, and Evidence columns");
  }

  return rows;
}

function loadAllowedStates(schemaPath) {
  if (!schemaPath) return DEFAULT_STATES;
  const schema = JSON.parse(readText(schemaPath));
  const states = schema?.properties?.state?.enum;
  if (!Array.isArray(states) || states.length === 0) {
    throw new Error(`Schema ${schemaPath} does not expose properties.state.enum`);
  }
  return states;
}

function shannonEntropy(value) {
  const counts = new Map();
  for (const char of value) counts.set(char, (counts.get(char) || 0) + 1);
  let entropy = 0;
  for (const count of counts.values()) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function charClassCount(value) {
  return [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[+/_=-]/.test(value),
  ].filter(Boolean).length;
}

function highEntropyCandidates(value) {
  return value.match(/[A-Za-z0-9+/_=-]{32,}/g) || [];
}

function findCredentialIssue(value) {
  for (const candidate of SECRET_PATTERNS) {
    if (candidate.pattern.test(value)) return candidate.name;
  }

  for (const token of highEntropyCandidates(value)) {
    if (charClassCount(token) >= 3 && shannonEntropy(token) >= 4.2) {
      return "high-entropy-candidate";
    }
  }

  return null;
}

export function validateMatrix({ rows, expectedRows, allowedStates = DEFAULT_STATES }) {
  const errors = [];
  const expectedById = new Map(expectedRows.map((row) => [row.id, row]));
  const seen = new Map();
  const allowedStateSet = new Set(allowedStates);

  for (const row of rows) {
    const id = normalizeCell(String(row.id || row.ID || ""));
    const state = normalizeCell(String(row.state || row.State || ""));
    const owner = normalizeCell(String(row.owner || row.Owner || ""));
    const evidence = normalizeCell(String(row.evidence || row.Evidence || ""));
    const type = normalizeCell(String(row.type || row.Type || ""));

    if (!id) {
      errors.push("row with blank ID is invalid");
      continue;
    }

    if (!expectedById.has(id)) {
      errors.push(`unknown row ID ${id}`);
    }

    seen.set(id, (seen.get(id) || 0) + 1);

    if (type && expectedById.has(id) && type !== expectedById.get(id).type) {
      errors.push(`${id}: type must be ${expectedById.get(id).type}`);
    }

    if (!allowedStateSet.has(state)) {
      errors.push(`${id}: invalid state`);
    }
    if (!owner) {
      errors.push(`${id}: owner is required`);
    }
    if (!evidence) {
      errors.push(`${id}: evidence is required`);
    }

    for (const [fieldName, fieldValue] of Object.entries(row)) {
      const text = String(fieldValue || "");
      const issue = findCredentialIssue(text);
      if (issue) {
        errors.push(`${id}: credential-like value detected in ${fieldName} (${issue})`);
      }
    }
  }

  for (const [id, count] of seen.entries()) {
    if (count > 1) {
      errors.push(`${id}: duplicate row`);
    }
  }

  for (const expected of expectedRows) {
    if (!seen.has(expected.id)) {
      errors.push(`${expected.id}: missing required row`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    expectedCount: expectedRows.length,
    rowCount: rows.length,
  };
}

function parseArgs(argv) {
  const args = {
    matrix: null,
    sourceRoot: ".planning",
    schema: null,
    printExpected: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--matrix") args.matrix = argv[++index];
    else if (arg === "--source-root") args.sourceRoot = argv[++index];
    else if (arg === "--schema") args.schema = argv[++index];
    else if (arg === "--print-expected") args.printExpected = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function renderExpectedMarkdown(rows) {
  return [
    "| ID | Type | State | Owner | Evidence | Notes |",
    "|---|---|---|---|---|---|",
    ...rows.map((row) => `| ${row.id} | ${row.type} | missing | phase8-owner | TODO-${row.id} | ${row.title.replace(/\|/g, "/")} |`),
  ].join("\n");
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const expectedRows = deriveExpectedRows({ sourceRoot: args.sourceRoot });

  if (args.printExpected) {
    process.stdout.write(`${renderExpectedMarkdown(expectedRows)}\n`);
    return 0;
  }

  if (!args.matrix) {
    throw new Error("--matrix is required unless --print-expected is used");
  }

  const allowedStates = loadAllowedStates(args.schema);
  const rows = parseMatrix(readText(args.matrix));
  const result = validateMatrix({ rows, expectedRows, allowedStates });

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`FAIL: ${error}`);
    }
    return 1;
  }

  console.log(`PASS: ${result.rowCount}/${result.expectedCount} Phase 8 acceptance rows validated`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
