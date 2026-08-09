import Link from "next/link";

import { studios } from "../../lib/studios";

export default function StudiosPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="space-y-4 text-center">
          <p className="text-2xl">🌿</p>

          <h1 className="text-4xl font-light tracking-wide sm:text-6xl">
            Studios
          </h1>

          <p className="mx-auto max-w-xl leading-7 text-stone-600">
            Quiet little corners of the internet for meaningful work.
          </p>
        </header>

        <nav className="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 transition-all hover:bg-stone-100"
          >
            Home
          </Link>

          <Link
            href="/gallery"
            className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 transition-all hover:bg-stone-100"
          >
            Gallery
          </Link>

          <Link
            href="/studios"
            aria-current="page"
            className="flex min-h-12 items-center justify-center rounded-full bg-stone-800 px-5 py-3 text-sm text-stone-50"
          >
            Studios
          </Link>
        </nav>

        <section className="grid gap-6 sm:grid-cols-2">
          {studios.map((studio) => (
            <Link
              key={studio.slug}
              href={`/studios/${studio.slug}`}
              className="group"
            >
              <article className="h-full rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                <p className="text-3xl">
                  {studio.symbol}
                </p>

                <h2 className="mt-5 text-2xl font-light text-stone-800">
                  {studio.name}
                </h2>

                <p className="mt-3 leading-7 text-stone-500">
                  {studio.subtitle}
                </p>

                <p className="mt-7 text-sm text-stone-500">
                  Open the door →
                </p>
              </article>
            </Link>
          ))}
        </section>

        <footer className="pt-6 text-center text-sm italic text-stone-400">
          Working with people to notice, understand and improve
          the places we share.
        </footer>
      </div>
    </main>
  );
}