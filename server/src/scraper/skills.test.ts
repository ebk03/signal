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

  describe("newly added AI/LLM terms", () => {
    it("matches each new keyword in a realistic sentence", () => {
      const skills = extractSkills(
        "We're a Generative AI startup building an AI Agent on top of RAG, " +
          "GenAI, Vector Database and Embeddings tech, with Prompt Engineering " +
          "as a core skill. We work closely with Anthropic's models.",
      );
      expect(skills.sort()).toEqual(
        [
          "RAG",
          "GenAI",
          "Generative AI",
          "Vector Database",
          "Embeddings",
          "Prompt Engineering",
          "AI Agent",
          "Anthropic",
        ].sort(),
      );
    });

    it("does not re-add already-tracked terms as duplicates", () => {
      const skills = extractSkills("We use LLM, Machine Learning, and OpenAI's API.");
      expect(skills.sort()).toEqual(["LLM", "Machine Learning", "OpenAI"].sort());
    });
  });

  describe("punctuation-adjacent short acronyms (the C#/.NET class of bug)", () => {
    it("matches RAG immediately followed by a hyphen", () => {
      expect(extractSkills("We built a RAG-based search system.")).toEqual(["RAG"]);
    });

    it("matches RAG wrapped in parentheses", () => {
      expect(extractSkills("retrieval-augmented generation (RAG) pipeline")).toEqual(["RAG"]);
    });

    it("matches LLM immediately followed by a hyphen", () => {
      expect(extractSkills("Our LLM-powered chatbot handles support.")).toEqual(["LLM"]);
    });

    it("matches GenAI immediately followed by a comma", () => {
      expect(extractSkills("Experience with GenAI, RAG, and vector search.").sort()).toEqual(
        ["GenAI", "RAG"].sort(),
      );
    });

    it("does not false-positive on 'rag' embedded inside unrelated words", () => {
      expect(extractSkills("We store files in cloud storage, not paragraphs of fragments.")).toEqual(
        [],
      );
    });
  });

  describe("general plural matching for multi-word keywords", () => {
    it("matches both singular and plural forms of AI Agent", () => {
      expect(extractSkills("Building an AI Agent for support.")).toEqual(["AI Agent"]);
      expect(extractSkills("Building autonomous AI Agents for support.")).toEqual(["AI Agent"]);
    });

    it("matches both singular and plural forms of React Native", () => {
      // "React" is also its own tracked keyword, so it correctly co-fires
      // alongside "React Native" in both forms — that's expected, not a bug.
      expect(extractSkills("We ship a React Native app.").sort()).toEqual(
        ["React", "React Native"].sort(),
      );
      expect(extractSkills("We ship several React Natives apps.").sort()).toEqual(
        ["React", "React Native"].sort(),
      );
    });

    it("does not match a keyword followed by more than one trailing letter", () => {
      expect(extractSkills("This role involves Reactive programming patterns.")).toEqual([]);
    });
  });
});
