"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();

  const confirmationUrl =
    searchParams.get("confirmation_url");

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-lg space-y-10">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🌿</p>

          <h1 className="text-4xl font-light tracking-wide text-stone-800">
            Your Studio is waiting.
          </h1>

          <p className="mx-auto max-w-md leading-7 text-stone-600">
            You&apos;ve been invited to join Nebari Gallery.
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">

          <p className="leading-7 text-stone-600">
            We&apos;ve made a Studio for you — a place
            to keep and share the things you make.
          </p>

          <p className="text-sm leading-6 text-stone-500">
            There&apos;s no need for it to be perfect.
            It just needs to be yours.
          </p>

          {confirmationUrl ? (
            <a
              href={confirmationUrl}
              className="flex w-full items-center justify-center rounded-full bg-stone-800 px-8 py-3 text-sm text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98]"
            >
              Set up my Studio →
            </a>
          ) : (
            <p className="rounded-xl bg-stone-100 p-4 text-sm leading-6 text-stone-600">
              This invitation link is incomplete.
              Please use the link from your Nebari invitation email.
            </p>
          )}

        </section>

        <footer className="text-center">
          <Link
            href="/"
            className="text-sm text-stone-400 transition-colors hover:text-stone-700"
          >
            Nebari Gallery
          </Link>
        </footer>

      </div>
    </main>
  );
}