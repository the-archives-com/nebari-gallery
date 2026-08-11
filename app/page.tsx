import Image from "next/image";
import Link from "next/link";

import OwnerLink from "./components/OwnerLink";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* TOP BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.14em]">

            <Link
              href="/"
              aria-current="page"
              className="border-b-2 border-nebari-green pb-2 text-nebari-green"
            >
              Home
            </Link>

            <Link
              href="/gallery"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Gallery
            </Link>

            <Link
              href="/studios"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Studios
            </Link>

          </nav>

        </div>
      </div>

      {/* HERO */}

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">

        <div className="mx-auto max-w-3xl text-center">

          <p className="nebari-brand text-xs text-nebari-maple">
            Studio Nebari
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink sm:text-7xl">
            A place for meaningful work.
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-nebari-muted">
            Personal Studios are where the work grows.
            Selected pieces come together in the shared Gallery.
          </p>

        </div>

        {/* PRIMARY DOORS */}

        <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-2">

          <Link
            href="/gallery"
            className="group rounded-2xl border border-nebari-border bg-nebari-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-nebari-sage hover:shadow-xl"
          >

            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-nebari-green">
              Shared Exhibition
            </p>

            <h2 className="nebari-serif mt-3 text-3xl font-medium text-nebari-ink">
              Gallery
            </h2>

            <p className="mt-3 text-sm leading-6 text-nebari-muted">
              Selected work from across personal Studios.
            </p>

            <p className="mt-6 text-sm text-nebari-green transition-all group-hover:translate-x-1">
              Enter the Gallery →
            </p>

          </Link>

          <Link
            href="/studios"
            className="group rounded-2xl border border-nebari-border bg-nebari-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-nebari-sage hover:shadow-xl"
          >

            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-nebari-green">
              Personal Spaces
            </p>

            <h2 className="nebari-serif mt-3 text-3xl font-medium text-nebari-ink">
              Studios
            </h2>

            <p className="mt-3 text-sm leading-6 text-nebari-muted">
              See what people are making and step into their Studios.
            </p>

            <p className="mt-6 text-sm text-nebari-green transition-all group-hover:translate-x-1">
              Visit the Studios →
            </p>

          </Link>

        </div>

        {/* MAKERS MARK */}

        <section className="mx-auto mt-20 w-full max-w-2xl">

          <div className="overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-lg">
            <Image
              src="/nebari-makers-mark.png"
              alt="Studio Nebari — Roots First. Growth Second."
              width={1536}
              height={1536}
              priority
              className="h-auto w-full"
            />
          </div>

        </section>

      </section>

      {/* DARK TIMBER FOOTER */}

      <footer className="border-t border-[#2b211c] bg-[#3b2f2a]">

        <div className="mx-auto max-w-6xl px-6 py-10 text-center">

          <div className="mx-auto mb-4 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-[#6b1d1d]" />

            <span className="text-[#6b1d1d]">
              ◆
            </span>

            <span className="h-px w-12 bg-[#6b1d1d]" />

          </div>

          <p className="nebari-brand text-xs text-[#e8e1d5]">
            Roots first. Growth second.
          </p>

          <div className="mt-6 flex justify-center gap-4 text-xs text-[#e8e1d5]/65">

            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>

            <span aria-hidden="true">
              ·
            </span>

            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>

            <span aria-hidden="true">
              ·
            </span>

            <OwnerLink />

          </div>

        </div>

      </footer>

    </main>
  );
}