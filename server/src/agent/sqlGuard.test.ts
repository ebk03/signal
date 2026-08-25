import { assertReadOnlySelect, enforceLimit } from "./sqlGuard.js";

describe("assertReadOnlySelect", () => {
  it("allows a plain SELECT", () => {
    expect(() => assertReadOnlySelect("SELECT * FROM job_postings")).not.toThrow();
  });

  it("allows a WITH ... SELECT (CTE)", () => {
    expect(() =>
      assertReadOnlySelect("WITH x AS (SELECT 1) SELECT * FROM x"),
    ).not.toThrow();
  });

  it("allows a query with a trailing comment after the semicolon", () => {
    expect(() =>
      assertReadOnlySelect("SELECT * FROM job_postings WHERE company = 'x'; --"),
    ).not.toThrow();
  });

  it("rejects DROP", () => {
    expect(() => assertReadOnlySelect("DROP TABLE job_postings")).toThrow();
  });

  it("rejects DELETE", () => {
    expect(() => assertReadOnlySelect("DELETE FROM job_postings")).toThrow();
  });

  it("rejects UPDATE", () => {
    expect(() => assertReadOnlySelect("UPDATE job_postings SET company = 'x'")).toThrow();
  });

  it("rejects multiple statements", () => {
    expect(() =>
      assertReadOnlySelect("SELECT * FROM job_postings; DELETE FROM job_postings"),
    ).toThrow();
  });

  it("rejects an empty query", () => {
    expect(() => assertReadOnlySelect("   ")).toThrow();
  });
});

describe("enforceLimit", () => {
  it("wraps a query with no LIMIT in a capped subquery", () => {
    const result = enforceLimit("SELECT * FROM job_postings");
    expect(result).toBe("SELECT * FROM (SELECT * FROM job_postings) AS agent_query LIMIT 1000");
  });

  it("leaves a query that already has a LIMIT unchanged", () => {
    const query = "SELECT * FROM job_postings LIMIT 10";
    expect(enforceLimit(query)).toBe(query);
  });
});
