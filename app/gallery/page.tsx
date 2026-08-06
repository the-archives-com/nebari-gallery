"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

type Legend = {
  id: number;
  created_at: string;
  title: string;
  reflection: string | null;
  image_url: string;
};

export default function GalleryPage() {
  const [legends, setLegends] = useState<Legend[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLegends() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("legends")
        .select("id, created_at, title, reflection, image_url")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load Legends:", error);
        setErrorMessage("The Gallery could not be loaded.");
        setLoading(false);
        return;
      }

      setLegends(data ?? []);
      setLoading(false);
    }

    loadLegends();
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 fade-in">
      <div className="mx-auto max-w-6xl space-y-10 text-center">
        <header className="space-y-3">
          <h1 className="text-4xl font-light tracking-wide sm:text-6xl">
            Gallery
          </h1>

          <p className="text-stone-600">
            The forest is beginning to grow.
          </p>
        </header>

<nav className="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-3">
  <Link
    href="/"
    aria-current="page"
    className="
      flex
      min-h-12
      items-center
      justify-center
      rounded-full
      bg-stone-800
      px-5
      py-3
      text-sm
      text-stone-50
      transition-all
      duration-300
      hover:scale-[1.02]
      hover:bg-stone-700
      active:scale-95
    "
  >
    Home
  </Link>

  <Link
    href="/gallery"
    className="
      flex
      min-h-12
      items-center
      justify-center
      rounded-full
      border
      border-stone-300
      bg-white
      px-5
      py-3
      text-sm
      text-stone-700
      transition-all
      duration-300
      hover:scale-[1.02]
      hover:border-stone-400
      hover:bg-stone-100
      active:scale-95
    "
  >
    Gallery
  </Link>

  <Link
    href="/record"
    className="
      flex
      min-h-12
      items-center
      justify-center
      rounded-full
      border
      border-stone-300
      bg-white
      px-5
      py-3
      text-sm
      text-stone-700
      transition-all
      duration-300
      hover:scale-[1.02]
      hover:border-stone-400
      hover:bg-stone-100
      active:scale-95
    "
  >
    Record a Legend
  </Link>
</nav>



        {loading && (
          <p className="italic text-stone-500">
            🌿 Walking through the Gallery...
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="text-red-700">
            {errorMessage}
          </p>
        )}

        {!loading && !errorMessage && legends.length === 0 && (
          <section className="mx-auto max-w-md rounded-2xl border border-stone-300 bg-white p-8 shadow-lg">
            <p className="text-2xl">🌱</p>

            <p className="mt-4 text-stone-600">
              No Legends have been planted yet.
            </p>

            <Link
              href="/record"
              className="
                mt-6
                inline-block
                rounded-full
                bg-stone-800
                px-8
                py-3
                text-stone-50
                transition-all
                duration-300
                hover:scale-105
                hover:bg-stone-700
                active:scale-95
              "
            >
              Record a Legend
            </Link>
          </section>
        )}

        {legends.length > 0 && (
          <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {legends.map((legend) => (
              <article
                key={legend.id}
                className="
                  rounded-lg
                  bg-white
                  p-3
                  pb-10
                  shadow-xl
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-2xl
                "
              >
                <div className="flex min-h-72 items-center justify-center overflow-hidden rounded bg-stone-100">
                  <img
                    src={legend.image_url}
                    alt={legend.title}
                    className="max-h-96 w-full object-contain"
                  />
                </div>

                <div className="px-3 pt-5 text-left">
                  <h2 className="text-lg font-medium text-stone-800">
                    {legend.title}
                  </h2>

                  {legend.reflection && (
                    <p className="mt-3 text-sm italic leading-6 text-stone-500">
                      {legend.reflection}
                    </p>
                  )}

                  <time
                    dateTime={legend.created_at}
                    className="mt-4 block text-xs text-stone-400"
                  >
                    {new Date(legend.created_at).toLocaleDateString(
                      "en-AU",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </time>
                </div>
              </article>
            ))}
          </section>
        )}

        <nav className="flex justify-center gap-6">
          <Link
            href="/"
            className="text-stone-600 transition-colors hover:text-stone-900"
          >
            ← Home
          </Link>

          <Link
            href="/record"
            className="text-stone-600 transition-colors hover:text-stone-900"
          >
            Record a Legend →
          </Link>
        </nav>
      </div>
    </main>
  );
}