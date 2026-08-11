"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabase";

type Studio = {
  slug: string;
  name: string;
  owner: string;
  description: string | null;
  icon: string | null;
  colour: string | null;
};

export default function ManageStudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStudios() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("studios")
        .select(
          "slug, name, owner, description, icon, colour",
        )
        .order("name", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Could not load Studios:",
          error,
        );

        setErrorMessage(
          "The Studio list could not be loaded.",
        );

        setLoading(false);
        return;
      }

      setStudios(data ?? []);
      setLoading(false);
    }

    loadStudios();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ADMIN BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <Link
            href="/account"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.14em]">
            <Link
              href="/admin/gallery"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Gallery Submissions
            </Link>

            <Link
              href="/account"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              My Account
            </Link>
          </nav>

        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-10 px-6 py-16">

        {/* HEADER */}

        <header className="text-center">

          <p className="text-3xl">
            🍁
          </p>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Nebari Administration
          </p>

          <h1 className="nebari-serif mt-4 text-5xl font-medium tracking-tight text-nebari-ink">
            Manage Studios
          </h1>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />
          </div>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-nebari-muted">
            Create Studios and keep an eye on the
            creative spaces growing around Nebari.
          </p>

        </header>

        {/* CREATE */}

        <div className="text-center">
          <Link
            href="/admin/studios/new"
            className="inline-flex items-center justify-center rounded-full bg-nebari-green px-8 py-3 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            + Create a Studio
          </Link>
        </div>

        {/* LOADING */}

        {loading && (
          <p className="text-center italic text-nebari-muted">
            Gathering the Studios...
          </p>
        )}

        {/* ERROR */}

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl border border-nebari-maple/20 bg-nebari-surface p-4 text-center text-sm text-nebari-maple"
          >
            {errorMessage}
          </p>
        )}

        {/* EMPTY */}

        {!loading &&
          !errorMessage &&
          studios.length === 0 && (
            <div className="rounded-2xl border border-dashed border-nebari-border bg-nebari-surface p-10 text-center">

              <h2 className="nebari-serif text-2xl text-nebari-ink">
                No Studios yet.
              </h2>

              <p className="mt-3 text-sm text-nebari-muted">
                The first one can be created whenever
                you&apos;re ready.
              </p>

            </div>
          )}

        {/* STUDIO DIRECTORY */}

        {!loading &&
          !errorMessage &&
          studios.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">

              {/* HEADINGS */}

              <div className="grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_80px] items-center gap-6 border-b border-nebari-border bg-nebari-paper/30 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">

                <span>
                  Studio
                </span>

                <span>
                  Owner
                </span>

                <span />

              </div>

              {/* ROWS */}

              {studios.map((studio) => (
                <div
                  key={studio.slug}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_80px] items-center gap-6 border-b border-nebari-border/60 px-5 py-4 transition-colors last:border-b-0 hover:bg-nebari-paper/30"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <span className="w-6 shrink-0 text-lg">
                      {studio.icon || "·"}
                    </span>

                    <div className="min-w-0">

                      <p className="truncate font-medium text-nebari-ink">
                        {studio.name}
                      </p>

                      <p className="mt-1 text-xs text-nebari-muted">
                        /{studio.slug}
                      </p>

                    </div>

                  </div>

                  <p className="truncate text-sm text-nebari-muted">
                    {studio.owner}
                  </p>

                  <div className="text-right">
                    <Link
                      href={`/studios/${studio.slug}`}
                      className="text-sm text-nebari-green transition-colors hover:text-nebari-maple"
                    >
                      Open →
                    </Link>
                  </div>

                </div>
              ))}

            </section>
          )}

        {/* ADMIN LINKS */}

        <div className="grid gap-3 sm:grid-cols-2">

          <Link
            href="/admin/gallery"
            className="flex items-center justify-between rounded-xl border border-nebari-border bg-nebari-surface px-5 py-4 text-sm text-nebari-ink transition-all hover:border-nebari-sage hover:bg-nebari-paper/30"
          >
            <span>
              Gallery Submissions
            </span>

            <span>
              →
            </span>
          </Link>

          <Link
            href="/account"
            className="flex items-center justify-between rounded-xl border border-nebari-border bg-nebari-surface px-5 py-4 text-sm text-nebari-ink transition-all hover:border-nebari-sage hover:bg-nebari-paper/30"
          >
            <span>
              My Account
            </span>

            <span>
              →
            </span>
          </Link>

        </div>

      </div>

      {/* DARK TIMBER FOOTER */}

      <footer className="mt-12 border-t border-[#2b211c] bg-[#3b2f2a]">
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

        </div>
      </footer>

    </main>
  );
}