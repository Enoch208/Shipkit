import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logo } from "./components/Logo";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  CommandIcon,
  CurrencyIcon,
  FilmRoll01Icon,
  FlashIcon,
  Github01Icon,
  ImageAdd02Icon,
  MusicNote01Icon,
  PlayIcon,
  RocketIcon,
  SparklesIcon,
  StarIcon,
  TextFontIcon,
  Tick02Icon,
  Wallet01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col">
      <Nav />
      <HeroSection />
      <ServiceStrip />
      <HowItWorks />
      <Features />
      <Pricing />
      <PayFlow />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/40 px-6 py-4 backdrop-blur-xl sm:px-10">
      <Link href="/" className="flex items-center gap-2 text-white">
        <Logo size={22} />
        <span className="text-[15px] font-medium tracking-tight">ShipKit</span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
        <a href="#how" className="transition-colors hover:text-white">
          How it works
        </a>
        <a href="#features" className="transition-colors hover:text-white">
          Features
        </a>
        <a href="#pricing" className="transition-colors hover:text-white">
          Pricing
        </a>
        <a href="#pay" className="transition-colors hover:text-white">
          x402
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 transition-colors hover:text-white"
        >
          GitHub
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={12} strokeWidth={1.8} />
        </a>
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/try"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
        >
          Try now
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black" />
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

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
          <HugeiconsIcon
            icon={StarIcon}
            size={12}
            strokeWidth={1.8}
            className="text-yellow-300"
          />
          <span className="font-mono">$0.50</span>
          <span className="text-white/50">per kit · USDC on Solana or Base</span>
        </div>

        <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
          Launch any repo or URL.
          <br />
          In 60 seconds.
          <br />
          <span className="font-serif font-normal italic tracking-tight text-[#f0dfb8]">
            — For $0.50.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/60">
          Paste a repo or URL. Get a cinematic trailer, theme song, three
          posters, and rewritten launch copy back in 60 seconds — billed per
          request in USDC, not per month.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/try"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
          >
            Try it now — free first kit
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm text-white/80 backdrop-blur-md transition-colors hover:bg-white/5 hover:text-white"
          >
            <HugeiconsIcon icon={PlayIcon} size={14} strokeWidth={1.8} />
            See how it works
          </a>
        </div>

        <div className="mt-10 flex items-center gap-3 text-xs text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <HugeiconsIcon icon={FlashIcon} size={12} strokeWidth={1.8} />
            4 AI services, 1 pipeline
          </span>
          <span className="text-white/20">◆</span>
          <span>Settles on-chain via x402</span>
        </div>
      </div>
    </section>
  );
}

function ServiceStrip() {
  const services = [
    { icon: SparklesIcon, label: "Ace Chat" },
    { icon: MusicNote01Icon, label: "Suno" },
    { icon: ImageAdd02Icon, label: "Midjourney" },
    { icon: FlashIcon, label: "Veo" },
    { icon: CommandIcon, label: "x402" },
  ];

  return (
    <section className="relative z-10 border-y border-white/5 bg-black px-6 py-8">
      <p className="mb-6 text-center text-[11px] uppercase tracking-[0.22em] text-white/35">
        One pipeline · six services
      </p>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {services.map((s) => (
          <div
            key={s.label}
            className="inline-flex items-center gap-2 text-white/55 transition-colors hover:text-white"
          >
            <HugeiconsIcon icon={s.icon} size={16} strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-[15px] leading-relaxed text-white/55">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Github01Icon,
      title: "Paste a repo or URL",
      body: "Any public GitHub repo or website. We pull the README, marketing copy, and metadata to build a brief.",
    },
    {
      num: "02",
      icon: ZapIcon,
      title: "Four services, in parallel",
      body: "Ace Chat writes the brief. Suno composes the song. Midjourney renders posters. Veo generates the trailer.",
    },
    {
      num: "03",
      icon: RocketIcon,
      title: "Download, share, ship",
      body: "60-second turnaround. Every asset watermarked. One x402 settlement visible on-chain.",
    },
  ];

  return (
    <section id="how" className="relative bg-black px-6 py-28">
      <SectionHeader
        eyebrow="How it works"
        title={
          <>
            One repo or URL in.
            <br />
            <span className="font-serif font-normal italic text-[#f0dfb8]">
              A launch kit out.
            </span>
          </>
        }
        subtitle="The entire pipeline fans out in parallel. You watch four spinners, not a progress bar."
      />

      <div className="mx-auto mt-16 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.num}
            className="flex flex-col gap-5 bg-black p-8 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white/40">{s.num}</span>
              <HugeiconsIcon
                icon={s.icon}
                size={20}
                strokeWidth={1.5}
                className="text-white/80"
              />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-white">
              {s.title}
            </h3>
            <p className="text-[14px] leading-relaxed text-white/55">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="relative bg-black px-6 py-28">
      <SectionHeader
        eyebrow="What ships"
        title={
          <>
            Everything a launch needs.
            <br />
            <span className="font-serif font-normal italic text-[#f0dfb8]">
              Nothing it doesn't.
            </span>
          </>
        }
        subtitle="Six assets shipped in one request. Each one ready to post, watermark included."
      />

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={FilmRoll01Icon}
          title="Cinematic trailer"
          body="5–10 seconds, rendered by Veo. Cinematic motion designed to anchor the launch."
          meta="Veo · 720p"
          span="lg:col-span-2"
        />
        <FeatureCard
          icon={MusicNote01Icon}
          title="Theme song"
          body="30-second launch anthem from Suno. Two variants — keep the one that slaps."
          meta="Suno · MP3"
        />
        <FeatureCard
          icon={ImageAdd02Icon}
          title="Three posters"
          body="16:9 hero, 1:1 for social, 9:16 for stories. Consistent look across every channel."
          meta="Midjourney v6"
        />
        <FeatureCard
          icon={TextFontIcon}
          title="Launch copy"
          body="README rewrite plus a 5-tweet thread, JSON-structured so you can drop it into a CMS."
          meta="Ace Chat · GPT-4o-mini"
        />
        <FeatureCard
          icon={CommandIcon}
          title="Install as a Skill"
          body={
            <>
              <code className="font-mono text-white/80">
                npx skills install shipkit
              </code>
              . Same pipeline from Claude Code, Cursor, or Copilot.
            </>
          }
          meta="MCP · Skills"
        />
        <FeatureCard
          icon={Wallet01Icon}
          title="Live x402 receipt"
          body="Every asset itemized in USDC. On-chain settlement on Solana or Base — the tx hash links straight from the kit page."
          meta="x402 · Solana / Base"
          span="lg:col-span-3"
        />
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  meta,
  span = "",
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  title: string;
  body: React.ReactNode;
  meta: string;
  span?: string;
}) {
  return (
    <div
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.04] ${span}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
          <HugeiconsIcon
            icon={icon}
            size={18}
            strokeWidth={1.5}
            className="text-white/80"
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/35">
          {meta}
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="text-[14px] leading-relaxed text-white/55">{body}</p>
    </div>
  );
}

function Pricing() {
  const subscriptions = [
    { name: "Runway", cost: 95 },
    { name: "Suno", cost: 10 },
    { name: "Midjourney", cost: 30 },
    { name: "ChatGPT", cost: 20 },
  ];
  const total = subscriptions.reduce((s, x) => s + x.cost, 0);

  return (
    <section
      id="pricing"
      className="relative border-y border-white/5 bg-black px-6 py-28"
    >
      <SectionHeader
        eyebrow="Pricing"
        title={
          <>
            <span className="font-mono">$0.50</span> per launch.
            <br />
            <span className="font-serif font-normal italic text-[#f0dfb8]">
              Zero when you're idle.
            </span>
          </>
        }
        subtitle="Pay per request in USDC. No seats, no minimum commitment, no forgotten subscription."
      />

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
        <div className="relative flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
              ShipKit
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
              <HugeiconsIcon icon={Tick02Icon} size={10} strokeWidth={2} />
              Pay per request
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-6xl font-semibold tracking-tight text-white">
                $0.50
              </span>
              <span className="text-sm text-white/50">/ kit</span>
            </div>
            <p className="mt-2 text-[14px] text-white/55">
              First kit is on us. After that, billed per request in USDC.
            </p>
          </div>
          <ul className="flex flex-col gap-3 text-[14px] text-white/70">
            <Bullet>Trailer + song + 3 posters + launch copy</Bullet>
            <Bullet>Live x402 settlement, on-chain tx</Bullet>
            <Bullet>Watermarked, commercial-use friendly</Bullet>
            <Bullet>$ACE holder discount applied automatically</Bullet>
          </ul>
          <Link
            href="/try"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01]"
          >
            Launch your first kit
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
          </Link>
        </div>

        <div className="relative flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/[0.01] p-8">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
              Subscriptions
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
              <HugeiconsIcon icon={CurrencyIcon} size={10} strokeWidth={1.8} />
              Monthly
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-6xl font-semibold tracking-tight text-white/35">
                ${total}
              </span>
              <span className="text-sm text-white/30">/ mo</span>
            </div>
            <p className="mt-2 text-[14px] text-white/45">
              What the equivalent toolbox costs — idle or not.
            </p>
          </div>
          <ul className="flex flex-col gap-3 font-mono text-[13px] text-white/50">
            {subscriptions.map((s) => (
              <li key={s.name} className="flex items-center justify-between">
                <span>{s.name}</span>
                <span className="text-white/30">${s.cost}/mo</span>
              </li>
            ))}
            <li className="mt-1 flex items-center justify-between border-t border-white/10 pt-3 text-white/80">
              <span>Total</span>
              <span>${total}/mo</span>
            </li>
          </ul>
          <p className="mt-auto pt-2 text-[12px] text-white/40">
            Break-even: <span className="font-mono text-white/70">310</span>{" "}
            ShipKit runs equals one month of subscriptions.
          </p>
        </div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <HugeiconsIcon
        icon={Tick02Icon}
        size={14}
        strokeWidth={2}
        className="mt-0.5 shrink-0 text-emerald-300"
      />
      <span>{children}</span>
    </li>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          backgroundImage: "url(/bg_img.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "110% auto",
          opacity: 0.55,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Your next launch is
          <br />
          <span className="font-serif font-normal italic text-[#f0dfb8]">
            60 seconds away.
          </span>
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">
          The first kit is on us. Paste a repo or URL, we'll do the rest.
        </p>
        <Link
          href="/try"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
        >
          Try it now
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}

function PayFlow() {
  const steps = [
    {
      num: "01",
      icon: Wallet01Icon,
      title: "Top up with x402",
      body: (
        <>
          Head to{" "}
          <a
            href="https://platform.acedata.cloud"
            target="_blank"
            rel="noreferrer"
            className="text-white underline underline-offset-2 hover:text-white/80"
          >
            platform.acedata.cloud
          </a>{" "}
          and pay with USDC on Solana or Base. You get an instant{" "}
          <span className="text-emerald-300">5% discount</span> vs card
          top-up.
        </>
      ),
    },
    {
      num: "02",
      icon: CommandIcon,
      title: "Paste your key",
      body: (
        <>
          Click{" "}
          <span className="font-mono text-white/75">Ace API key</span> on the{" "}
          <Link
            href="/try"
            className="text-white underline underline-offset-2 hover:text-white/80"
          >
            /try
          </Link>{" "}
          page. Stored in your browser only — we never see it.
        </>
      ),
    },
    {
      num: "03",
      icon: Tick02Icon,
      title: "Watch it settle",
      body: (
        <>
          Generate a kit. Each asset is itemized in USDC and deducted from your
          Ace wallet at x402 rates. Hold <span className="font-mono">$ACE</span>{" "}
          for additional tier discounts.
        </>
      ),
    },
  ];

  return (
    <section
      id="pay"
      className="relative border-t border-white/5 bg-black px-6 py-28"
    >
      <SectionHeader
        eyebrow="Pay per request"
        title={
          <>
            x402 native.
            <br />
            <span className="font-serif font-normal italic text-[#f0dfb8]">
              5% off, forever.
            </span>
          </>
        }
        subtitle="Every kit is billed in USDC via x402. Top up once, pay as you ship — no credit card, no lock-in, on-chain proof."
      />

      <div className="mx-auto mt-16 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.num}
            className="flex flex-col gap-5 bg-black p-8 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white/40">{s.num}</span>
              <HugeiconsIcon
                icon={s.icon}
                size={20}
                strokeWidth={1.5}
                className="text-white/80"
              />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-white">
              {s.title}
            </h3>
            <p className="text-[14px] leading-relaxed text-white/55">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
          <span>Sample receipt · one kit</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono normal-case tracking-normal text-[10px] text-emerald-300">
            <HugeiconsIcon icon={Tick02Icon} size={10} strokeWidth={2} />
            Settled via x402
          </span>
        </div>
        <ul className="flex flex-col gap-1.5 font-mono text-[13px] text-white/70">
          <ReceiptRow label="Ace Chat · brief" value="$0.003" />
          <ReceiptRow label="Suno · theme song" value="$0.080" />
          <ReceiptRow label="Midjourney · ×3 posters" value="$0.120" />
          <ReceiptRow label="Veo · trailer" value="$0.350" />
        </ul>
        <div className="mt-3 flex flex-col gap-1 border-t border-dashed border-white/10 pt-3 font-mono text-[13px] text-white/55">
          <ReceiptRow label="Subtotal" value="$0.553" />
          <ReceiptRow label="x402 (−5%)" value="−$0.028" emerald />
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-3 font-mono text-white">
          <span className="text-sm">Total</span>
          <span className="text-lg font-semibold">$0.525</span>
        </div>
      </div>
    </section>
  );
}

function ReceiptRow({
  label,
  value,
  emerald,
}: {
  label: string;
  value: string;
  emerald?: boolean;
}) {
  return (
    <li className="flex items-baseline justify-between">
      <span>{label}</span>
      <span className={emerald ? "text-emerald-300" : "text-white/90"}>
        {value}
      </span>
    </li>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-white/40 sm:flex-row">
        <div className="flex items-center gap-2 text-white/60">
          <Logo size={16} />
          <span className="font-medium tracking-tight">ShipKit</span>
          <span className="text-white/30">·</span>
          <span>Built on Ace Data Cloud</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how" className="transition-colors hover:text-white">
            How it works
          </a>
          <a href="#pricing" className="transition-colors hover:text-white">
            Pricing
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-white"
          >
            GitHub
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={10}
              strokeWidth={1.8}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
