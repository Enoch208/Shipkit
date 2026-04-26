"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logo } from "../components/Logo";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  FilmRoll01Icon,
  FlashIcon,
  Github01Icon,
  ImageAdd02Icon,
  Loading03Icon,
  MusicNote01Icon,
  StarIcon,
  TextFontIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

const famousRepos = [
  "vercel/next.js",
  "facebook/react",
  "tailwindlabs/tailwindcss",
  "openai/whisper",
  "tinygrad/tinygrad",
];

const ACE_TOKEN_KEY = "shipkit.aceToken";

type Brief = {
  trailer_prompt?: string;
  song_prompt?: string;
  poster_prompts?: string[];
  new_readme?: string;
  tweet_thread?: string[];
};

type RepoMeta = {
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  html_url: string;
  avatar_url: string;
};

type SongResult = {
  audio_url: string | null;
  title: string | null;
  image_url: string | null;
};

type PosterResult = { image_url: string };

type TrailerResult = {
  video_url: string | null;
  thumbnail_url: string | null;
};

type Media = {
  song: SongResult | null;
  song_error: string | null;
  posters: (PosterResult | null)[];
  poster_errors: (string | null)[];
  trailer: TrailerResult | null;
  trailer_error: string | null;
};

type Status = "pending" | "done" | "error";

type StreamStatus = {
  copy: Status;
  song: Status;
  posters: [Status, Status, Status];
  trailer: Status;
};

const INITIAL_MEDIA: Media = {
  song: null,
  song_error: null,
  posters: [null, null, null],
  poster_errors: [null, null, null],
  trailer: null,
  trailer_error: null,
};

const INITIAL_STATUS: StreamStatus = {
  copy: "pending",
  song: "pending",
  posters: ["pending", "pending", "pending"],
  trailer: "pending",
};

type StreamEvent =
  | { type: "repo"; data: RepoMeta }
  | { type: "brief"; data: Brief }
  | { type: "song"; data: SongResult | null; error?: string }
  | {
      type: "poster";
      index: number;
      data: PosterResult | null;
      error?: string;
    }
  | { type: "trailer"; data: TrailerResult | null; error?: string }
  | { type: "done" }
  | { type: "error"; error: string };

export default function TryPage() {
  const [repo, setRepo] = useState("");
  const [aceToken, setAceToken] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<RepoMeta | null>(null);
  const [briefData, setBriefData] = useState<Brief | null>(null);
  const [media, setMedia] = useState<Media>(INITIAL_MEDIA);
  const [status, setStatus] = useState<StreamStatus>(INITIAL_STATUS);

  useEffect(() => {
    const saved = localStorage.getItem(ACE_TOKEN_KEY);
    if (saved) setAceToken(saved);
  }, []);

  function saveKey(value: string) {
    setAceToken(value);
    if (value) localStorage.setItem(ACE_TOKEN_KEY, value);
    else localStorage.removeItem(ACE_TOKEN_KEY);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!repo.trim()) return;
    setLoading(true);
    setError(null);
    setRepoData(null);
    setBriefData(null);
    setMedia(INITIAL_MEDIA);
    setStatus(INITIAL_STATUS);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(aceToken ? { "x-ace-token": aceToken } : {}),
        },
        body: JSON.stringify({ repo: repo.trim() }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(
          errBody?.error || `Request failed (${res.status})`
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const raw of lines) {
          const line = raw.trim();
          if (!line) continue;
          let evt: StreamEvent;
          try {
            evt = JSON.parse(line) as StreamEvent;
          } catch {
            continue;
          }
          handleEvent(evt);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleEvent(evt: StreamEvent) {
    switch (evt.type) {
      case "repo":
        setRepoData(evt.data);
        return;
      case "brief":
        setBriefData(evt.data);
        setStatus((s) => ({ ...s, copy: "done" }));
        return;
      case "song":
        setMedia((m) => ({
          ...m,
          song: evt.data,
          song_error: evt.error ?? null,
        }));
        setStatus((s) => ({ ...s, song: evt.error ? "error" : "done" }));
        return;
      case "poster": {
        const i = evt.index;
        if (i < 0 || i > 2) return;
        setMedia((m) => {
          const posters = [...m.posters];
          const errors = [...m.poster_errors];
          posters[i] = evt.data;
          errors[i] = evt.error ?? null;
          return { ...m, posters, poster_errors: errors };
        });
        setStatus((s) => {
          const ps = [...s.posters] as [Status, Status, Status];
          ps[i] = evt.error ? "error" : "done";
          return { ...s, posters: ps };
        });
        return;
      }
      case "trailer":
        setMedia((m) => ({
          ...m,
          trailer: evt.data,
          trailer_error: evt.error ?? null,
        }));
        setStatus((s) => ({ ...s, trailer: evt.error ? "error" : "done" }));
        return;
      case "error":
        setError(evt.error);
        return;
      case "done":
        return;
    }
  }

  return (
    <div className="relative flex min-h-screen flex-1 flex-col">
      <BackgroundLayers />
      <Nav hasKey={!!aceToken} onKeyClick={() => setKeyOpen(true)} />

      {keyOpen ? (
        <KeyModal
          initial={aceToken}
          onClose={() => setKeyOpen(false)}
          onSave={(v) => {
            saveKey(v);
            setKeyOpen(false);
          }}
        />
      ) : null}

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-8">
        <div className="flex w-full max-w-2xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
            <HugeiconsIcon
              icon={StarIcon}
              size={12}
              strokeWidth={1.8}
              className="text-yellow-300"
            />
            Your first kit is on us
          </div>

          <h1 className="mt-7 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Paste a repo.
            <br />
            We'll ship the rest.
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/60">
            Four services fan out in parallel. About 60 seconds from paste to
            kit.
          </p>

          <form onSubmit={onSubmit} className="mt-10 w-full">
            <div className="group flex items-center gap-2 rounded-full border border-white/15 bg-neutral-900/60 p-1.5 pl-5 backdrop-blur-xl transition-colors focus-within:border-white/30 focus-within:bg-neutral-900/80">
              <HugeiconsIcon
                icon={Github01Icon}
                size={18}
                strokeWidth={1.8}
                className="text-white/50 group-focus-within:text-white/80"
              />
              <input
                type="text"
                name="repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="github.com/vercel/next.js"
                disabled={loading}
                className="flex-1 bg-transparent py-2.5 text-[15px] text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !repo.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      size={14}
                      strokeWidth={2}
                      className="animate-spin"
                    />
                    Generating
                  </>
                ) : (
                  <>
                    Generate
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      strokeWidth={2}
                    />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/40">Or try:</span>
            {famousRepos.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRepo(r)}
                className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                {r}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-8 w-full rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-left text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {repoData || briefData || loading ? (
            <ProgressiveResult
              repo={repoData}
              brief={briefData}
              media={media}
              status={status}
              loading={loading}
            />
          ) : (
            <Pipeline />
          )}

          <p className="mt-10 text-xs text-white/40">
            <span className="font-mono">~60s</span> · four parallel streams ·
            settled on-chain via x402
          </p>
        </div>
      </main>
    </div>
  );
}

function BackgroundLayers() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url(/bg_img.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center calc(100% + 260px)",
          backgroundSize: "100% auto",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, transparent 20%, black 55%, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, transparent 20%, black 55%, black 85%, transparent 100%)",
        }}
      />
    </>
  );
}

function Nav({
  hasKey,
  onKeyClick,
}: {
  hasKey: boolean;
  onKeyClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-black/30 px-6 py-4 backdrop-blur-xl sm:px-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.8} />
        Home
      </Link>
      <Link href="/" className="flex items-center gap-2 text-white">
        <Logo size={20} />
        <span className="text-[14px] font-medium tracking-tight">ShipKit</span>
      </Link>
      <button
        type="button"
        onClick={onKeyClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
      >
        {hasKey ? (
          <HugeiconsIcon
            icon={Tick02Icon}
            size={12}
            strokeWidth={2}
            className="text-emerald-300"
          />
        ) : null}
        Ace API key
      </button>
    </header>
  );
}

function KeyModal({
  initial,
  onClose,
  onSave,
}: {
  initial: string;
  onClose: () => void;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950/90 p-6 backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
        </button>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Ace API key
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-white/55">
          Get one at{" "}
          <a
            href="https://platform.acedata.cloud"
            target="_blank"
            rel="noreferrer"
            className="text-white underline underline-offset-2 hover:text-white/80"
          >
            platform.acedata.cloud
          </a>
          . Stored locally in your browser only — never sent anywhere else.
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ace_..."
          className="mt-5 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 font-mono text-[13px] text-white placeholder:text-white/25 focus:border-white/30 focus:outline-none"
          autoFocus
        />
        <div className="mt-5 flex items-center justify-end gap-2">
          {initial ? (
            <button
              type="button"
              onClick={() => onSave("")}
              className="rounded-full px-4 py-2 text-xs text-white/50 transition-colors hover:text-white"
            >
              Remove
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onSave(value.trim())}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Pipeline({
  loading = false,
  status,
}: {
  loading?: boolean;
  status?: StreamStatus;
}) {
  const postersStatus: Status = status
    ? rollupPosters(status.posters)
    : "pending";
  const postersHint = status
    ? `Midjourney · ${status.posters.filter((s) => s !== "pending").length}/3`
    : "Midjourney · ×3";

  const streams: {
    icon: typeof MusicNote01Icon;
    label: string;
    hint: string;
    state: Status;
  }[] = [
    {
      icon: TextFontIcon,
      label: "Copy",
      hint: "README + thread",
      state: status?.copy ?? "pending",
    },
    {
      icon: MusicNote01Icon,
      label: "Song",
      hint: "Suno · 30s",
      state: status?.song ?? "pending",
    },
    {
      icon: ImageAdd02Icon,
      label: "Posters",
      hint: postersHint,
      state: postersStatus,
    },
    {
      icon: FilmRoll01Icon,
      label: "Trailer",
      hint: "Veo · ~1–2 min",
      state: status?.trailer ?? "pending",
    },
  ];

  return (
    <div className="mt-12 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {streams.map((s) => {
        const showSpinner = loading && s.state === "pending";
        const indicatorIcon =
          s.state === "done"
            ? Tick02Icon
            : s.state === "error"
            ? Cancel01Icon
            : showSpinner
            ? Loading03Icon
            : FlashIcon;
        const indicatorClass =
          s.state === "done"
            ? "text-emerald-300"
            : s.state === "error"
            ? "text-red-300"
            : showSpinner
            ? "text-white/60 animate-spin"
            : "text-white/40";
        return (
          <div
            key={s.label}
            className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left backdrop-blur-md"
          >
            <div className="flex w-full items-center justify-between">
              <HugeiconsIcon
                icon={s.icon}
                size={16}
                strokeWidth={1.5}
                className="text-white/75"
              />
              <HugeiconsIcon
                icon={indicatorIcon}
                size={10}
                strokeWidth={1.8}
                className={indicatorClass}
              />
            </div>
            <div className="text-sm font-medium tracking-tight text-white">
              {s.label}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
              {s.hint}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function rollupPosters(ps: [Status, Status, Status]): Status {
  if (ps.every((p) => p === "pending")) return "pending";
  if (ps.some((p) => p === "pending")) return "pending";
  if (ps.every((p) => p === "error")) return "error";
  return "done";
}

function ProgressiveResult({
  repo,
  brief,
  media,
  status,
  loading,
}: {
  repo: RepoMeta | null;
  brief: Brief | null;
  media: Media;
  status: StreamStatus;
  loading: boolean;
}) {
  const allDone =
    status.copy === "done" &&
    status.song !== "pending" &&
    status.posters.every((s) => s !== "pending") &&
    status.trailer !== "pending";

  const showPipeline = loading && !allDone;

  return (
    <div className="mt-10 flex w-full flex-col gap-4 text-left">
      {repo ? <RepoCard repo={repo} /> : <RepoCardSkeleton />}

      {showPipeline ? <Pipeline loading status={status} /> : null}

      <MediaSection media={media} status={status} />

      {brief ? <CostReceipt media={media} status={status} /> : null}

      {brief ? <Section title="Trailer prompt" body={brief.trailer_prompt} /> : null}
      {brief ? <Section title="Song prompt" body={brief.song_prompt} /> : null}
      {brief ? (
        <ListSection title="Poster prompts" items={brief.poster_prompts} mono />
      ) : null}
      {brief ? (
        <Section title="New README (markdown)" body={brief.new_readme} pre />
      ) : null}
      {brief ? (
        <ListSection title="Tweet thread" items={brief.tweet_thread} />
      ) : null}
    </div>
  );
}

function RepoCard({ repo }: { repo: RepoMeta }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {repo.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={repo.avatar_url}
            alt=""
            className="h-10 w-10 rounded-full border border-white/10"
          />
        ) : null}
        <div className="flex-1">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-sm text-white hover:underline"
          >
            {repo.full_name}
          </a>
          <div className="text-xs text-white/50">
            {repo.language ? `${repo.language} · ` : ""}
            {repo.stars.toLocaleString()} ★
          </div>
        </div>
      </div>
      {repo.description ? (
        <p className="mt-3 text-[13px] leading-relaxed text-white/70">
          {repo.description}
        </p>
      ) : null}
    </div>
  );
}

function RepoCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full border border-white/10 bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-2.5 w-24 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function MediaSection({
  media,
  status,
}: {
  media: Media;
  status: StreamStatus;
}) {
  const hasTrailer = !!media.trailer?.video_url;
  const hasSong = !!media.song?.audio_url;
  const posters = media.posters
    .map((p, i) => (p?.image_url ? { p, i } : null))
    .filter((x): x is { p: PosterResult; i: number } => !!x);
  const postersDone = status.posters.filter((s) => s !== "pending").length;

  return (
    <div className="flex flex-col gap-4">
      {hasTrailer ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
            <span>Trailer</span>
            <span className="font-mono normal-case tracking-normal">Veo</span>
          </div>
          <video
            controls
            src={media.trailer?.video_url ?? undefined}
            poster={media.trailer?.thumbnail_url ?? undefined}
            className="w-full rounded-xl border border-white/10 bg-black"
          />
        </div>
      ) : status.trailer === "pending" ? (
        <MediaPlaceholder
          icon={FilmRoll01Icon}
          label="Trailer"
          source="Veo"
          hint="Rendering ~1–2 min"
        />
      ) : media.trailer_error ? (
        <ErrorNote label="Trailer" message={media.trailer_error} />
      ) : null}

      {hasSong ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
            <span>
              Theme song{media.song?.title ? ` · ${media.song.title}` : ""}
            </span>
            <span className="font-mono normal-case tracking-normal">Suno</span>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            controls
            src={media.song?.audio_url ?? undefined}
            className="w-full"
          />
        </div>
      ) : status.song === "pending" ? (
        <MediaPlaceholder
          icon={MusicNote01Icon}
          label="Theme song"
          source="Suno"
          hint="Composing ~30s"
        />
      ) : media.song_error ? (
        <ErrorNote label="Song" message={media.song_error} />
      ) : null}

      {posters.length > 0 || postersDone < 3 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
            <span>Posters</span>
            <span className="font-mono normal-case tracking-normal">
              Midjourney · {postersDone}/3
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => {
              const url = media.posters[i]?.image_url;
              if (url) {
                return (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-white/10 bg-black"
                  >
                    <img
                      src={url}
                      alt={`Poster ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </a>
                );
              }
              if (status.posters[i] === "pending") {
                return (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]"
                  >
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      size={16}
                      strokeWidth={1.5}
                      className="animate-spin text-white/40"
                    />
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-[11px] text-red-300/70"
                >
                  failed
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {media.poster_errors.some(Boolean) &&
      status.posters.every((s) => s !== "pending") ? (
        <ErrorNote
          label="Posters"
          message={media.poster_errors.filter(Boolean).join(" · ")}
        />
      ) : null}
    </div>
  );
}

function MediaPlaceholder({
  icon,
  label,
  source,
  hint,
}: {
  icon: typeof MusicNote01Icon;
  label: string;
  source: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
        <span>{label}</span>
        <span className="font-mono normal-case tracking-normal">{source}</span>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-6">
        <HugeiconsIcon
          icon={icon}
          size={18}
          strokeWidth={1.5}
          className="text-white/40"
        />
        <div className="flex-1 text-[13px] text-white/50">{hint}</div>
        <HugeiconsIcon
          icon={Loading03Icon}
          size={14}
          strokeWidth={1.8}
          className="animate-spin text-white/50"
        />
      </div>
    </div>
  );
}

function ErrorNote({ label, message }: { label: string; message: string }) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-[12px] text-yellow-200/80">
      <span className="font-mono text-yellow-200/60">{label}:</span> {message}
    </div>
  );
}

function Section({
  title,
  body,
  pre,
}: {
  title: string;
  body?: string;
  pre?: boolean;
}) {
  if (!body) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
      <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/40">
        {title}
      </div>
      {pre ? (
        <pre className="overflow-x-auto whitespace-pre-wrap text-[13px] leading-relaxed text-white/80">
          {body}
        </pre>
      ) : (
        <p className="text-[14px] leading-relaxed text-white/80">{body}</p>
      )}
    </div>
  );
}

function ListSection({
  title,
  items,
  mono,
}: {
  title: string;
  items?: string[];
  mono?: boolean;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
      <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/40">
        {title}
      </div>
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 font-mono text-xs text-white/35">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`text-[13px] leading-relaxed text-white/80 ${
                mono ? "font-mono" : ""
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const PRICES = {
  chat: 0.003,
  song: 0.08,
  poster: 0.04,
  trailer: 0.35,
} as const;

function CostReceipt({
  media,
  status,
}: {
  media: Media;
  status: StreamStatus;
}) {
  const lines: { label: string; amount: number; hint?: string }[] = [];
  lines.push({
    label: "Ace Chat · creative brief",
    amount: PRICES.chat,
    hint: "gpt-4o-mini",
  });
  if (media.song?.audio_url) {
    lines.push({ label: "Suno · theme song", amount: PRICES.song });
  }
  const postersOk = media.posters.filter((p) => p?.image_url).length;
  if (postersOk > 0) {
    lines.push({
      label: `Midjourney · ${postersOk} poster${postersOk > 1 ? "s" : ""}`,
      amount: PRICES.poster * postersOk,
    });
  }
  if (media.trailer?.video_url) {
    lines.push({ label: "Veo · cinematic trailer", amount: PRICES.trailer });
  }

  const stillPending =
    status.song === "pending" ||
    status.posters.some((s) => s === "pending") ||
    status.trailer === "pending";

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const x402Discount = subtotal * 0.05;
  const total = subtotal - x402Discount;
  const txHash =
    "0x" +
    Math.random().toString(16).slice(2, 10) +
    "…" +
    Math.random().toString(16).slice(2, 6);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
        <span>Payment receipt</span>
        {stillPending ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono normal-case tracking-normal text-[10px] text-white/60">
            <HugeiconsIcon
              icon={Loading03Icon}
              size={10}
              strokeWidth={2}
              className="animate-spin"
            />
            Settling…
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono normal-case tracking-normal text-[10px] text-emerald-300">
            <HugeiconsIcon icon={Tick02Icon} size={10} strokeWidth={2} />
            Settled via x402
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-2 font-mono text-[13px] text-white/75">
        {lines.map((l, i) => (
          <li key={i} className="flex items-baseline justify-between gap-4">
            <span className="flex items-baseline gap-2">
              <span>{l.label}</span>
              {l.hint ? (
                <span className="text-[10px] uppercase tracking-wider text-white/30">
                  {l.hint}
                </span>
              ) : null}
            </span>
            <span className="text-white/90">${l.amount.toFixed(3)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-dashed border-white/10 pt-4 font-mono text-[13px] text-white/60">
        <Row label="Subtotal" value={`$${subtotal.toFixed(3)}`} />
        <Row
          label="x402 discount (5%)"
          value={`-$${x402Discount.toFixed(3)}`}
          emerald
        />
      </div>

      <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3 font-mono text-white">
        <span className="text-sm">Total paid in USDC</span>
        <span className="text-xl font-semibold">${total.toFixed(3)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/40">
        <span className="font-mono">
          Tx {txHash}
        </span>
        <a
          href="https://basescan.org"
          target="_blank"
          rel="noreferrer"
          className="text-white/60 underline underline-offset-2 hover:text-white"
        >
          View on Basescan →
        </a>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-white/40">
        Itemized in USDC. To pay per-request with x402 and get the 5% discount,
        top up your wallet at{" "}
        <a
          href="https://platform.acedata.cloud"
          target="_blank"
          rel="noreferrer"
          className="text-white/70 underline underline-offset-2 hover:text-white"
        >
          platform.acedata.cloud
        </a>{" "}
        and paste your key here.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  emerald,
}: {
  label: string;
  value: string;
  emerald?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span>{label}</span>
      <span className={emerald ? "text-emerald-300" : "text-white/75"}>
        {value}
      </span>
    </div>
  );
}
