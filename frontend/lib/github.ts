export type RepoMeta = {
  full_name: string;
  owner: string;
  name: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  license: string | null;
  avatar_url: string;
  html_url: string;
  readme: string;
};

export function parseRepoUrl(input: string): { owner: string; repo: string } {
  const trimmed = input
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");

  const urlMatch = trimmed.match(/github\.com[\/:]([^\/\s]+)\/([^\/\s]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

  const shortMatch = trimmed.match(/^([^\/\s]+)\/([^\/\s]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };

  throw new Error(
    "Could not parse repo. Use github.com/owner/repo or owner/repo."
  );
}

export async function fetchRepo(input: string): Promise<RepoMeta> {
  const { owner, repo } = parseRepoUrl(input);
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "shipkit",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [repoRes, readmeRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      cache: "no-store",
    }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(`Repo not found: ${owner}/${repo}`);
    }
    if (repoRes.status === 403) {
      throw new Error(
        "GitHub rate limit hit. Set GITHUB_TOKEN or wait an hour."
      );
    }
    throw new Error(`GitHub API error (${repoRes.status})`);
  }

  const data = await repoRes.json();

  let readme = "";
  if (readmeRes.ok) {
    const readmeData = await readmeRes.json();
    if (readmeData?.content) {
      readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
      if (readme.length > 8000) {
        readme = readme.slice(0, 8000) + "\n\n[... truncated]";
      }
    }
  }

  return {
    full_name: data.full_name,
    owner: data.owner?.login ?? owner,
    name: data.name,
    description: data.description ?? null,
    homepage: data.homepage ?? null,
    language: data.language ?? null,
    topics: Array.isArray(data.topics) ? data.topics : [],
    stars: data.stargazers_count ?? 0,
    license: data.license?.spdx_id ?? null,
    avatar_url: data.owner?.avatar_url ?? "",
    html_url: data.html_url,
    readme,
  };
}
