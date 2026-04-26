const ACE_BASE = "https://api.acedata.cloud";

function jsonHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function errText(res: Response) {
  const t = await res.text().catch(() => "");
  return t.slice(0, 240);
}

export type SongResult = {
  audio_url: string | null;
  title: string | null;
  image_url: string | null;
};

export async function generateSong(
  token: string,
  prompt: string
): Promise<SongResult> {
  const res = await fetch(`${ACE_BASE}/suno/audios`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ action: "generate", prompt }),
  });
  if (!res.ok) throw new Error(`Suno ${res.status}: ${await errText(res)}`);
  const data = await res.json();
  const variants =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.audios) && data.audios) ||
    [data];
  const first = variants[0] ?? {};
  return {
    audio_url: first.audio_url ?? first.audioUrl ?? null,
    title: first.title ?? null,
    image_url: first.image_url ?? null,
  };
}

export type PosterResult = { image_url: string };

export async function generatePoster(
  token: string,
  prompt: string
): Promise<PosterResult> {
  const res = await fetch(`${ACE_BASE}/midjourney/imagine`, {
    method: "POST",
    headers: {
      ...jsonHeaders(token),
      Accept: "application/x-ndjson",
    },
    body: JSON.stringify({ prompt, action: "generate" }),
  });
  if (!res.ok)
    throw new Error(`Midjourney ${res.status}: ${await errText(res)}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Midjourney: empty response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let lastImageUrl: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      try {
        const evt = JSON.parse(line);
        if (typeof evt.image_url === "string") lastImageUrl = evt.image_url;
        if (evt.progress === 100 && typeof evt.image_url === "string") {
          return { image_url: evt.image_url };
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  if (!lastImageUrl) throw new Error("Midjourney: no image in stream");
  return { image_url: lastImageUrl };
}

export type TrailerResult = {
  video_url: string | null;
  thumbnail_url: string | null;
};

export async function generateTrailer(
  token: string,
  prompt: string,
  frameUrl?: string
): Promise<TrailerResult> {
  const body: Record<string, unknown> = {
    action: "generate",
    prompt,
    aspect_ratio: "16:9",
  };
  if (frameUrl) body.start_image_url = frameUrl;
  const res = await fetch(`${ACE_BASE}/luma/videos`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Luma ${res.status}: ${await errText(res)}`);
  const data = await res.json();
  if (data?.success === false) {
    throw new Error(`Luma: ${data?.error?.message ?? "generation failed"}`);
  }
  return {
    video_url: data?.video_url ?? null,
    thumbnail_url: data?.thumbnail_url ?? null,
  };
}
