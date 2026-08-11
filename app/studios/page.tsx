"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

type Studio = {
  slug: string;
  name: string;
  owner: string;
  description: string | null;
  icon: string | null;
  colour: string | null;
};

export default function StudiosPage() {
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
          "The Studios could not be loaded.",
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
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-10">

        {/* HEADER */}

        <header className="space-y-4 text-center">
          <p className="text-3xl">
            🌿
          </p>

          <h1 className="text-4xl font-light tracking-wide text-stone-800 sm:text-5xl">
            Studios
          </h1>

          <p className="mx-auto max-w-xl leading-7 text-stone-600">
            Quiet little corners of the internet
            for meaningful work.
          </p>
        </header>

        {/* NAVIGATION */}

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

        {/* LOADING */}

        {loading && (
          <p className="text-center italic text-stone-500">
            🌿 Gathering the Studios...
          </p>
        )}

        {/* ERROR */}

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}

        {/* EMPTY */}

        {!loading &&
          !errorMessage &&
          studios.length === 0 && (
            <p className="text-center text-stone-500">
              No Studios have opened yet.
            </p>
          )}

        {/* STUDIO DIRECTORY */}

        {!loading &&
          !errorMessage &&
          studios.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

              {/* COLUMN HEADINGS */}

              <div className="grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_80px] items-center gap-6 border-b border-stone-200 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                <span>
                  Studio
                </span>

                <span>
                  Artist
                </span>

                <span />
              </div>

              {/* STUDIO ROWS */}

              {studios.map((studio) => (
                <Link
                  key={studio.slug}
                  href={`/studios/${studio.slug}`}
                  className="group grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_80px] items-center gap-6 border-b border-stone-100 px-5 py-4 transition-colors last:border-b-0 hover:bg-stone-50"
                >

                  {/* STUDIO */}

                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-xl">
                      {studio.icon || "🌿"}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-800">
                        {studio.name}
                      </p>

                      {studio.description && (
                        <p className="mt-1 truncate text-xs text-stone-400">
                          {studio.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* OWNER */}

                  <p className="truncate text-sm text-stone-600">
                    {studio.owner || "—"}
                  </p>

                  {/* ACTION */}

                  <div className="text-right">
                    <span className="text-sm text-stone-500 transition-colors group-hover:text-stone-900">
                      Open →
                    </span>
                  </div>

                </Link>
              ))}

            </section>
          )}

        {/* FOOTER */}

        <footer className="pt-4 text-center text-sm italic text-stone-400">
          Working with people to notice,
          understand and improve the places we share.
        </footer>

      </div>
    </main>
  );
}