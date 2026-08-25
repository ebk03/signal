import { parseComment } from "./parse.js";

describe("parseComment", () => {
  it("decodes HTML entities cleanly (regression: &#x2F; garbling company names)", () => {
    const rawHtml =
      "Snout https:&#x2F;&#x2F;snout.com&#x2F;<p>Remote (US or Ontario, Canada)<p>" +
      "We are looking for a Full Stack Engineer. Tech stack: TypeScript, React, Node.js, PostgreSQL, AWS.";

    const result = parseComment(rawHtml);

    expect(result.company).toBe("Snout https://snout.com/");
    expect(result.role).toBe("Full Stack Engineer");
    expect(result.remote).toBe(true);
    expect(result.location).toMatch(/^Remote/);
    expect(result.skills.sort()).toEqual(
      ["AWS", "Node.js", "PostgreSQL", "React", "TypeScript"].sort(),
    );
  });

  it("returns null fields (not a throw) when nothing is confidently extractable", () => {
    const rawHtml =
      "This is a very long unstructured comment that rambles on without any clear " +
      "indication of company name or role or location information whatsoever, making " +
      "it impossible to extract meaningful structured fields from heuristics alone.";

    const result = parseComment(rawHtml);

    expect(result.company).toBeNull();
    expect(result.role).toBeNull();
    expect(result.location).toBeNull();
    expect(result.remote).toBe(false);
    expect(result.skills).toEqual([]);
  });

  it("handles an empty string without throwing", () => {
    expect(() => parseComment("")).not.toThrow();
    const result = parseComment("");
    expect(result).toEqual({
      company: null,
      role: null,
      skills: [],
      location: null,
      remote: false,
    });
  });
});
