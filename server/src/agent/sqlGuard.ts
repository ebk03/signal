const DISALLOWED_KEYWORDS = [
  "insert", "update", "delete", "drop", "alter", "truncate", "grant", "revoke",
  "create", "copy", "execute", "call", "merge", "vacuum", "reindex", "listen",
  "notify", "lock", "do", "comment", "set", "reset", "begin", "commit", "rollback",
];

function stripComments(sqlText: string): string {
  return sqlText.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Heuristic guard, not a full SQL parser — the real safety guarantee is the
 * database-level `agent_readonly` role, which physically cannot run DDL/DML.
 * This just fails fast with a clear error before we even hit the network.
 */
export function assertReadOnlySelect(query: string): void {
  const cleaned = stripComments(query).trim();
  if (!cleaned) {
    throw new Error("Query is empty.");
  }

  const withoutTrailingSemicolon = cleaned.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) {
    throw new Error("Only a single SQL statement is allowed.");
  }

  if (!/^(select|with)\b/i.test(withoutTrailingSemicolon)) {
    throw new Error("Only SELECT statements are allowed.");
  }

  for (const keyword of DISALLOWED_KEYWORDS) {
    const pattern = new RegExp(`\\b${keyword}\\b`, "i");
    if (pattern.test(withoutTrailingSemicolon)) {
      throw new Error(`Disallowed keyword detected: "${keyword}".`);
    }
  }
}

export function enforceLimit(query: string, maxRows = 1000): string {
  const cleaned = query.replace(/;\s*$/, "").trim();
  if (/\blimit\s+\d+/i.test(cleaned)) {
    return cleaned;
  }
  return `SELECT * FROM (${cleaned}) AS agent_query LIMIT ${maxRows}`;
}
