export type WebsiteMeta = {
  url: string;
  domain: string;
  title: string;
  description: string | null;
  image_url: string | null;
  favicon_url: string | null;
  content: string;
};

const MAX_CONTENT = 6000;
const FETCH_TIMEOUT_MS = 10000;

function normalizeUrl(input: string): string {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  return s;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function pick(re: RegExp, html: string): string | null {
  const m = html.match(re);
  return m ? decodeEntities(m[1].trim()) : null;
}

function pickMeta(
  html: string,
  key: string,
  attr: "name" | "property"
): string | null {
  const escKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const r1 = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${escKey}["']`,
    "i"
  );
  const m1 = html.match(r1);
  if (m1) return decodeEntities(m1[1].trim());
  const r2 = new RegExp(
    `<meta\\s+[^>]*${attr}=["']${escKey}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  const m2 = html.match(r2);
  if (m2) return decodeEntities(m2[1].trim());
  return null;
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function resolveUrl(href: string | null, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

async function fetchHtml(url: string): Promise<string> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ShipKit/1.0; +https://shipkit.dev)",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchJina(url: string): Promise<string> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "text/plain" },
      cache: "no-store",
      signal: ac.signal,
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }
}

export async function fetchWebsite(input: string): Promise<WebsiteMeta> {
  const url = normalizeUrl(input);
  const base = new URL(url);

  let html = "";
  try {
    html = await fetchHtml(url);
  } catch {
    // Primary fetch failed; we'll lean on Jina below.
  }

  const ogTitle = html ? pickMeta(html, "og:title", "property") : null;
  const titleTag = html ? pick(/<title[^>]*>([^<]+)<\/title>/i, html) : null;
  const domain = base.hostname.replace(/^www\./, "");
  const title = ogTitle ?? titleTag ?? domain;

  const description = html
    ? pickMeta(html, "description", "name") ??
      pickMeta(html, "og:description", "property")
    : null;

  const ogImage = html ? pickMeta(html, "og:image", "property") : null;
  const image_url = resolveUrl(ogImage, url);

  const favHref = html
    ? pick(
        /<link\s+[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
        html
      ) ??
      pick(
        /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon)["']/i,
        html
      )
    : null;
  const favicon_url = resolveUrl(favHref ?? "/favicon.ico", url);

  let body = html ? stripHtml(html) : "";
  if (body.length < 400) {
    const jina = await fetchJina(url);
    if (jina.length > body.length) body = jina;
  }

  if (!body) {
    throw new Error(`Could not fetch ${url}`);
  }

  if (body.length > MAX_CONTENT) {
    body = body.slice(0, MAX_CONTENT) + "\n\n[... truncated]";
  }

  return {
    url,
    domain,
    title,
    description,
    image_url,
    favicon_url,
    content: body,
  };
}
