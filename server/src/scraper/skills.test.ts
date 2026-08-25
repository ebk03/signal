import { extractSkills } from "./skills.js";

describe("extractSkills", () => {
  it("matches punctuation-edged keywords like C# and .NET", () => {
    const skills = extractSkills("We build our backend in C# on .NET.");
    expect(skills.sort()).toEqual(["C#", ".NET"].sort());
  });

  it("matches Golang without also matching 'Go' as a separate substring hit", () => {
    const skills = extractSkills("Our services are written in Golang.");
    expect(skills).toEqual(["Golang"]);
  });

  it("matches multiple distinct skills from a realistic sentence", () => {
    const skills = extractSkills(
      "Tech stack: TypeScript, React, Node.js, PostgreSQL, AWS.",
    );
    expect(skills.sort()).toEqual(
      ["AWS", "Node.js", "PostgreSQL", "React", "TypeScript"].sort(),
    );
  });

  it("returns an empty array when nothing matches", () => {
    expect(extractSkills("We are a small remote-first team.")).toEqual([]);
  });
});
