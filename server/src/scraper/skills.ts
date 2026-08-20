export const SKILL_KEYWORDS = [
  // languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Golang", "Rust",
  "Ruby", "PHP", "Swift", "Kotlin", "Scala", "Elixir", "Haskell", "C",
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
  // mobile
  "iOS", "Android", "React Native", "Flutter",
] as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractSkills(text: string): string[] {
  const found = new Set<string>();
  for (const skill of SKILL_KEYWORDS) {
    const pattern = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
    if (pattern.test(text)) {
      found.add(skill);
    }
  }
  return [...found];
}
