import { fetchRepo, RepoMeta } from "./github";
import { fetchWebsite, WebsiteMeta } from "./website";

export type SourceKind = "github" | "website";

export type Source =
  | { kind: "github"; meta: RepoMeta }
  | { kind: "website"; meta: WebsiteMeta };

export function detectSourceKind(input: string): SourceKind {
  const trimmed = input.trim();
  if (/(?:^|\/\/)github\.com\//i.test(trimmed)) return "github";
  const noProto = trimmed.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const m = noProto.match(/^([^\/\s]+)\/([^\/\s]+)$/);
  if (m && !m[1].includes(".")) return "github";
  return "website";
}

export async function fetchSource(input: string): Promise<Source> {
  const kind = detectSourceKind(input);
  if (kind === "github") {
    return { kind, meta: await fetchRepo(input) };
  }
  return { kind, meta: await fetchWebsite(input) };
}

export function sourceToPrompt(s: Source): string {
  if (s.kind === "github") {
    const r = s.meta;
    return [
      `Source: GitHub repo`,
      `Repo: ${r.full_name}`,
      `Description: ${r.description ?? "(none)"}`,
      `Homepage: ${r.homepage ?? "(none)"}`,
      `Language: ${r.language ?? "(unknown)"}`,
      `Topics: ${r.topics.join(", ") || "(none)"}`,
      `Stars: ${r.stars}`,
      "",
      "README:",
      r.readme || "(no README)",
    ].join("\n");
  }
  const w = s.meta;
  return [
    `Source: website`,
    `URL: ${w.url}`,
    `Title: ${w.title}`,
    `Description: ${w.description ?? "(none)"}`,
    "",
    "Page content:",
    w.content || "(empty)",
  ].join("\n");
}
