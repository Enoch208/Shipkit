import { NextRequest, NextResponse } from "next/server";
import { fetchSource, sourceToPrompt } from "@/lib/source";
import { aceChatJson } from "@/lib/ace";
import {
  generatePoster,
  generateSong,
  generateTrailer,
} from "@/lib/ace-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SYSTEM_PROMPT = `You are a launch copywriter for a product-launch kit generator. Given a software project's metadata and content (either a GitHub repo with README, or a website's landing page), return ONLY a JSON object (no prose, no markdown fences) with these fields:

- trailer_prompt: 1-2 sentences describing a cinematic 5-10s video trailer (visual scene only, no on-screen text).
- song_prompt: 1 sentence describing a 30s launch anthem — vibe, tempo, instrumentation.
- poster_prompts: array of 3 Midjourney prompts for 16:9 hero, 1:1 square, and 9:16 vertical poster. Each must include Midjourney modifiers like --ar and --v 6.
- new_readme: a launch-page markdown writeup (250-500 words) with a sharp hook, features bullets, a quickstart snippet if relevant, and a link back to the source.
- tweet_thread: array of 5 short tweets (each under 240 chars) launching the project. First is the hook, last is a CTA.

Be concrete, visual, and on-brand for the project. No generic marketing fluff.`;

type Brief = {
  trailer_prompt?: string;
  song_prompt?: string;
  poster_prompts?: string[];
  new_readme?: string;
  tweet_thread?: string[];
};

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sourceInput = body?.repo ?? body?.source;
  const skipMedia = body?.skipMedia === true;

  if (!sourceInput || typeof sourceInput !== "string") {
    return NextResponse.json(
      { error: "Missing 'source' or 'repo' in request body." },
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

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  const send = async (event: object) => {
    try {
      await writer.write(encoder.encode(JSON.stringify(event) + "\n"));
    } catch {
      // writer closed; drop silently
    }
  };

  const run = async () => {
    try {
      const source = await fetchSource(sourceInput);
      await send({ type: "source", data: source });

      const brief = (await aceChatJson(
        aceToken,
        SYSTEM_PROMPT,
        sourceToPrompt(source)
      )) as Brief;
      await send({ type: "brief", data: brief });

      if (skipMedia) {
        await send({ type: "done" });
        return;
      }

      const posterPrompts = (brief.poster_prompts ?? []).slice(0, 3);
      while (posterPrompts.length < 3) posterPrompts.push("");

      const tasks: Promise<unknown>[] = [];

      if (brief.song_prompt) {
        tasks.push(
          generateSong(aceToken, brief.song_prompt)
            .then((data) => send({ type: "song", data }))
            .catch((e) =>
              send({ type: "song", data: null, error: errMessage(e) })
            )
        );
      } else {
        await send({ type: "song", data: null, error: "no song prompt" });
      }

      for (let i = 0; i < 3; i++) {
        const p = posterPrompts[i];
        if (p) {
          tasks.push(
            generatePoster(aceToken, p)
              .then((data) => send({ type: "poster", index: i, data }))
              .catch((e) =>
                send({
                  type: "poster",
                  index: i,
                  data: null,
                  error: errMessage(e),
                })
              )
          );
        } else {
          await send({
            type: "poster",
            index: i,
            data: null,
            error: "no poster prompt",
          });
        }
      }

      if (brief.trailer_prompt) {
        tasks.push(
          generateTrailer(aceToken, brief.trailer_prompt)
            .then((data) => send({ type: "trailer", data }))
            .catch((e) =>
              send({ type: "trailer", data: null, error: errMessage(e) })
            )
        );
      } else {
        await send({ type: "trailer", data: null, error: "no trailer prompt" });
      }

      await Promise.all(tasks);
      await send({ type: "done" });
    } catch (err) {
      await send({ type: "error", error: errMessage(err) });
    } finally {
      try {
        await writer.close();
      } catch {
        // already closed
      }
    }
  };

  // Fire-and-forget — Response returns immediately so the stream is hot.
  run();

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
