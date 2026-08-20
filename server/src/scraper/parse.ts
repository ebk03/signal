import { extractSkills } from "./skills.js";

const ROLE_KEYWORDS = [
  "Full Stack Engineer", "Full-Stack Engineer", "Backend Engineer", "Frontend Engineer",
  "Software Engineer", "Data Scientist", "Data Engineer", "DevOps Engineer",
  "Site Reliability Engineer", "Machine Learning Engineer", "ML Engineer",
  "Product Manager", "Engineering Manager", "iOS Engineer", "Android Engineer",
  "Designer",
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripHtml(html: string): string {
  return html
    .replace(/<p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .trim();
}

function extractRole(text: string): string | null {
  const snippet = text.slice(0, 300);
  for (const role of ROLE_KEYWORDS) {
    const pattern = new RegExp(`\\b${escapeRegex(role)}\\b`, "i");
    if (pattern.test(snippet)) return role;
  }
  return null;
}

function extractCompany(text: string): string | null {
  const firstLine = text.split("\n")[0]?.trim();
  if (!firstLine) return null;
  const beforeDelimiter = firstLine.split(/\s[|–-]\s/)[0]?.trim();
  const candidate = beforeDelimiter || firstLine;
  return candidate.length > 0 && candidate.length <= 80 ? candidate : null;
}

function extractLocation(text: string): string | null {
  const snippet = text.slice(0, 300);
  const match = snippet.match(/\b(Remote|Onsite|On-site|Hybrid)\b[^\n|]*/i);
  return match ? match[0].trim() : null;
}

function extractRemote(text: string): boolean {
  return /\bremote\b/i.test(text);
}

export interface ParsedPosting {
  company: string | null;
  role: string | null;
  skills: string[];
  location: string | null;
  remote: boolean;
}

export function parseComment(rawHtml: string): ParsedPosting {
  const text = stripHtml(rawHtml);
  return {
    company: extractCompany(text),
    role: extractRole(text),
    skills: extractSkills(text),
    location: extractLocation(text),
    remote: extractRemote(text),
  };
}
