import Image from "next/image";
import Link from "next/link";
import OwnerLink from "./components/OwnerLink";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">

        <header className="space-y-5 text-center">
          <p className="text-3xl">🌿</p>

          <h1 className="text-4xl font-light tracking-wide sm:text-6xl">
            Nebari Gallery
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-stone-600">
            A shared place for creative work to branch outward.
          </p>
        </header>

        <nav className="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <Link
            href="/"
            aria-current="page"
            className="flex min-h-12 items-center justify-center rounded-full bg-stone-800 px-5 py-3 text-sm text-stone-50 transition-all duration-300 hover:scale-[1.02] hover:bg-stone-700 active:scale-95"
          >
            Home
          </Link>

          <Link
            href="/gallery"
            className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 transition-all duration-300 hover:scale-[1.02] hover:border-stone-400 hover:bg-stone-100 active:scale-95"
          >
            Gallery
          </Link>

          <Link
            href="/studios"
            className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 transition-all duration-300 hover:scale-[1.02] hover:border-stone-400 hover:bg-stone-100 active:scale-95"
          >
            Studios
          </Link>
        </nav>

        <section className="mx-auto max-w-2xl text-center">
          <p className="text-base leading-8 text-stone-600">
            Personal Studios are where the work grows.
            Selected pieces come together in the shared Gallery.
          </p>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <Image
            src="/nebari-makers-mark.png"
            alt="Studio Nebari — Roots First. Growth Second."
            width={1536}
            height={1536}
            priority
            className="h-auto w-full rounded-2xl shadow-lg"
          />
        </section>


        <footer className="space-y-4 text-center text-sm text-stone-500">
          <p>
            An idea grown at
            <br />
            <strong>Studio Nebari</strong>
          </p>

          <p className="italic">
            Roots first. Growth second.
          </p>

          <div className="flex justify-center gap-4 text-xs text-stone-400">
            <Link
              href="/privacy"
              className="transition-colors hover:text-stone-700"
            >
              Privacy
            </Link>

            <span aria-hidden="true">·</span>

            <Link
              href="/terms"
              className="transition-colors hover:text-stone-700"
            >
              Terms
            </Link>

            <span aria-hidden="true">·</span>

            <OwnerLink />
          </div>
        </footer>

      </div>
    </main>
  );
}