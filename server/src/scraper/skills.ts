export const SKILL_KEYWORDS = [
  // languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Golang", "Rust",
  "Ruby", "PHP", "Swift", "Kotlin", "Scala", "Elixir", "Haskell",
  // frontend
  "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "HTML", "CSS", "Tailwind",
  "Redux", "GraphQL",
  // backend / frameworks
  "Node.js", "Express", "Fastify", "Django", "Flask", "FastAPI", "Rails", "Spring",
  "Laravel", ".NET", "gRPC", "REST",
  // data
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB", "Elasticsearch",
  "Kafka", "Snowflake", "BigQuery", "Spark", "Airflow",
  // infra / cloud
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Jenkins", "CI/CD",
  "Linux", "Nginx",
  // ml / ai
  "Machine Learning", "TensorFlow", "PyTorch", "NLP", "LLM", "OpenAI",
  "RAG", "GenAI", "Generative AI", "Vector Database", "Embeddings",
  "Prompt Engineering", "AI Agent", "Anthropic",
  // mobile
  "iOS", "Android", "React Native", "Flutter",
] as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractSkills(text: string): string[] {
  const found = new Set<string>();
  for (const skill of SKILL_KEYWORDS) {
    // \b is defined relative to \w (letters/digits/underscore), so it silently
    // fails to match at the edges of keywords like "C#", "C++", or ".NET" —
    // the boundary between "#"/"+"/"." and surrounding punctuation or spaces
    // never counts as a word boundary. An alphanumeric-aware lookaround
    // handles punctuation-edged keywords correctly instead. The optional
    // trailing "s" lets multi-word keywords match their plural form too
    // (e.g. "React Native" also matches "React Natives"), without requiring
    // a separate dictionary entry per form.
    const pattern = new RegExp(
      `(?<![A-Za-z0-9])${escapeRegex(skill)}s?(?![A-Za-z0-9])`,
      "i",
    );
    if (pattern.test(text)) {
      found.add(skill);
    }
  }
  return [...found];
}
