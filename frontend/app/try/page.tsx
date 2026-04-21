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

type GenerateResponse = {
  repo: RepoMeta;
  brief: Brief;
  media: Media | null;
};

export default function TryPage() {
  const [repo, setRepo] = useState("");
  const [aceToken, setAceToken] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

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
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(aceToken ? { "x-ace-token": aceToken } : {}),
        },
        body: JSON.stringify({ repo: repo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setResult(data as GenerateResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
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

          {loading && !result ? <Pipeline loading /> : null}
          {result ? <BriefResult data={result} /> : null}
          {!loading && !result ? <Pipeline /> : null}

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

function Pipeline({ loading = false }: { loading?: boolean }) {
  const streams = [
    { icon: MusicNote01Icon, label: "Song", hint: "Suno · 30s" },
    { icon: ImageAdd02Icon, label: "Posters", hint: "Midjourney · ×3" },
    { icon: FilmRoll01Icon, label: "Trailer", hint: "Veo · 5–10s" },
    { icon: TextFontIcon, label: "Copy", hint: "README + thread" },
  ];
  return (
    <div className="mt-12 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {streams.map((s) => (
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
              icon={loading ? Loading03Icon : FlashIcon}
              size={10}
              strokeWidth={1.8}
              className={`text-white/40 ${loading ? "animate-spin" : ""}`}
            />
          </div>
          <div className="text-sm font-medium tracking-tight text-white">
            {s.label}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            {s.hint}
          </div>
        </div>
      ))}
    </div>
  );
}

function BriefResult({ data }: { data: GenerateResponse }) {
  const { repo, brief, media } = data;
  return (
    <div className="mt-10 flex w-full flex-col gap-4 text-left">
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

      {media ? <MediaSection media={media} /> : null}
      {media ? <CostReceipt media={media} /> : null}

      <Section title="Trailer prompt" body={brief.trailer_prompt} />
      <Section title="Song prompt" body={brief.song_prompt} />
      <ListSection title="Poster prompts" items={brief.poster_prompts} mono />
      <Section title="New README (markdown)" body={brief.new_readme} pre />
      <ListSection title="Tweet thread" items={brief.tweet_thread} />
    </div>
  );
}

function MediaSection({ media }: { media: Media }) {
  const hasTrailer = !!media.trailer?.video_url;
  const hasSong = !!media.song?.audio_url;
  const posters = media.posters.filter(
    (p): p is PosterResult => !!p?.image_url
  );

  return (
    <div className="flex flex-col gap-4">
      {hasTrailer ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
            <span>Trailer</span>
            <span className="font-mono normal-case tracking-normal">
              Veo
            </span>
          </div>
          <video
            controls
            src={media.trailer?.video_url ?? undefined}
            poster={media.trailer?.thumbnail_url ?? undefined}
            className="w-full rounded-xl border border-white/10 bg-black"
          />
        </div>
      ) : media.trailer_error ? (
        <ErrorNote label="Trailer" message={media.trailer_error} />
      ) : null}

      {hasSong ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
            <span>Theme song{media.song?.title ? ` · ${media.song.title}` : ""}</span>
            <span className="font-mono normal-case tracking-normal">Suno</span>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            controls
            src={media.song?.audio_url ?? undefined}
            className="w-full"
          />
        </div>
      ) : media.song_error ? (
        <ErrorNote label="Song" message={media.song_error} />
      ) : null}

      {posters.length > 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
            <span>Posters</span>
            <span className="font-mono normal-case tracking-normal">
              Midjourney · ×{posters.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {posters.map((p, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <a
                key={i}
                href={p.image_url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-xl border border-white/10 bg-black"
              >
                <img
                  src={p.image_url}
                  alt={`Poster ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {media.poster_errors.some(Boolean) ? (
        <ErrorNote
          label="Posters"
          message={media.poster_errors.filter(Boolean).join(" · ")}
        />
      ) : null}
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

function CostReceipt({ media }: { media: Media }) {
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
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono normal-case tracking-normal text-[10px] text-emerald-300">
          <HugeiconsIcon icon={Tick02Icon} size={10} strokeWidth={2} />
          Settled via x402
        </span>
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
