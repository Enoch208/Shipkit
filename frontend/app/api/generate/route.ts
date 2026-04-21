import { NextRequest, NextResponse } from "next/server";
import { fetchRepo } from "@/lib/github";
import { aceChatJson } from "@/lib/ace";
import {
  generatePoster,
  generateSong,
  generateTrailer,
  PosterResult,
  SongResult,
  TrailerResult,
} from "@/lib/ace-media";

export const runtime = "nodejs";
export const maxDuration = 300;

const SYSTEM_PROMPT = `You are a launch copywriter for a product-launch kit generator. Given a GitHub repo's metadata and README, return ONLY a JSON object (no prose, no markdown fences) with these fields:

- trailer_prompt: 1-2 sentences describing a cinematic 5-10s video trailer (visual scene only, no on-screen text).
- song_prompt: 1 sentence describing a 30s launch anthem — vibe, tempo, instrumentation.
- poster_prompts: array of 3 Midjourney prompts for 16:9 hero, 1:1 square, and 9:16 vertical poster. Each must include Midjourney modifiers like --ar and --v 6.
- new_readme: a rewritten README in markdown (250-500 words) with a sharp hook, features bullets, install snippet, and link to the original.
- tweet_thread: array of 5 short tweets (each under 240 chars) launching the project. First is the hook, last is a CTA.

Be concrete, visual, and on-brand for the repo. No generic marketing fluff.`;

type Brief = {
  trailer_prompt?: string;
  song_prompt?: string;
  poster_prompts?: string[];
  new_readme?: string;
  tweet_thread?: string[];
};

type Settled<T> = { ok: true; value: T } | { ok: false; error: string };

function wrap<T>(p: Promise<T>): Promise<Settled<T>> {
  return p
    .then((value) => ({ ok: true as const, value }))
    .catch((e: unknown) => ({
      ok: false as const,
      error: e instanceof Error ? e.message : String(e),
    }));
}

function settledOrNull<T>(s: Settled<T>): T | null {
  return s.ok ? s.value : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const repoInput = body?.repo;
    const skipMedia = body?.skipMedia === true;

    if (!repoInput || typeof repoInput !== "string") {
      return NextResponse.json(
        { error: "Missing 'repo' in request body." },
        { status: 400 }
      );
    }

    const aceToken =
      req.headers.get("x-ace-token") || process.env.ACEDATA_API_TOKEN;

    if (!aceToken) {
      return NextResponse.json(
        {
          error:
            "No Ace API key. Set one via the 'Ace API key' button, or configure ACEDATA_API_TOKEN on the server.",
        },
        { status: 401 }
      );
    }

    const repo = await fetchRepo(repoInput);

    const userPrompt = [
      `Repo: ${repo.full_name}`,
      `Description: ${repo.description ?? "(none)"}`,
      `Homepage: ${repo.homepage ?? "(none)"}`,
      `Language: ${repo.language ?? "(unknown)"}`,
      `Topics: ${repo.topics.join(", ") || "(none)"}`,
      `Stars: ${repo.stars}`,
      "",
      "README:",
      repo.readme || "(no README)",
    ].join("\n");

    const brief = (await aceChatJson(
      aceToken,
      SYSTEM_PROMPT,
      userPrompt
    )) as Brief;

    if (skipMedia) {
      return NextResponse.json({ repo, brief, media: null });
    }

    const posterPrompts = (brief.poster_prompts ?? []).slice(0, 3);
    while (posterPrompts.length < 3) posterPrompts.push("");

    const tasks: [
      Promise<Settled<SongResult>>,
      Promise<Settled<PosterResult>>,
      Promise<Settled<PosterResult>>,
      Promise<Settled<PosterResult>>,
      Promise<Settled<TrailerResult>>
    ] = [
      brief.song_prompt
        ? wrap(generateSong(aceToken, brief.song_prompt))
        : Promise.resolve({ ok: false, error: "no song prompt" } as const),
      posterPrompts[0]
        ? wrap(generatePoster(aceToken, posterPrompts[0]))
        : Promise.resolve({ ok: false, error: "no poster prompt" } as const),
      posterPrompts[1]
        ? wrap(generatePoster(aceToken, posterPrompts[1]))
        : Promise.resolve({ ok: false, error: "no poster prompt" } as const),
      posterPrompts[2]
        ? wrap(generatePoster(aceToken, posterPrompts[2]))
        : Promise.resolve({ ok: false, error: "no poster prompt" } as const),
      brief.trailer_prompt
        ? wrap(generateTrailer(aceToken, brief.trailer_prompt))
        : Promise.resolve({ ok: false, error: "no trailer prompt" } as const),
    ];

    const [songR, p1, p2, p3, trailerR] = await Promise.all(tasks);

    const media = {
      song: settledOrNull(songR),
      song_error: songR.ok ? null : songR.error,
      posters: [p1, p2, p3].map((p) => settledOrNull(p)),
      poster_errors: [p1, p2, p3].map((p) => (p.ok ? null : p.error)),
      trailer: settledOrNull(trailerR),
      trailer_error: trailerR.ok ? null : trailerR.error,
    };

    return NextResponse.json({ repo, brief, media });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
