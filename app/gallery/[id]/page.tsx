"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabase";

type Legend = {
  id: number;
  created_at: string;
  title: string;
  reflection: string | null;
  image_url: string;
};

export default function LegendPage() {
  const params = useParams<{ id: string }>();

  const [legend, setLegend] = useState<Legend | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLegend() {
      setLoading(true);
      setErrorMessage("");

      const legendId = Number(params.id);

      if (!Number.isInteger(legendId)) {
        setErrorMessage("This Legend could not be found.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("legends")
        .select("id, created_at, title, reflection, image_url")
        .eq("id", legendId)
        .single();

      if (error) {
        console.error("Could not load Legend:", error);
        setErrorMessage("This Legend could not be found.");
        setLoading(false);
        return;
      }

      setLegend(data);
      setLoading(false);
    }

    loadLegend();
  }, [params.id]);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 fade-in">
      <div className="mx-auto max-w-5xl space-y-10 text-center">
        <nav className="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 transition-all duration-300 hover:scale-[1.02] hover:border-stone-400 hover:bg-stone-100 active:scale-95"
          >
            Home
          </Link>

          <Link
            href="/gallery"
            aria-current="page"
            className="flex min-h-12 items-center justify-center rounded-full bg-stone-800 px-5 py-3 text-sm text-stone-50 transition-all duration-300 hover:scale-[1.02] hover:bg-stone-700 active:scale-95"
          >
            Gallery
          </Link>

          <Link
            href="/record"
            className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 transition-all duration-300 hover:scale-[1.02] hover:border-stone-400 hover:bg-stone-100 active:scale-95"
          >
            Record a Legend
          </Link>
        </nav>

        {loading && (
          <p className="italic text-stone-500">
            🌿 Stepping closer...
          </p>
        )}

        {errorMessage && (
          <section className="mx-auto max-w-md rounded-2xl border border-stone-300 bg-white p-8 shadow-lg">
            <p role="alert" className="text-stone-700">
              {errorMessage}
            </p>

            <Link
              href="/gallery"
              className="mt-6 inline-block text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
            >
              ← Return to Gallery
            </Link>
          </section>
        )}

        {legend && (
          <article className="space-y-8">
            <header className="space-y-3">
              <h1 className="text-4xl font-light tracking-wide sm:text-6xl">
                {legend.title}
              </h1>

              <time
                dateTime={legend.created_at}
                className="block text-sm text-stone-500"
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
            </header>

            <section className="mx-auto max-w-4xl rounded-lg bg-white p-3 pb-14 shadow-2xl">
              <div className="flex min-h-80 items-center justify-center overflow-hidden rounded bg-stone-100">
                <img
                  src={legend.image_url}
                  alt={legend.title}
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>
            </section>

            {legend.reflection && (
              <section className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-8 text-left shadow-sm">
                <p className="text-sm font-medium text-stone-500">
                  Reflection Pond
                </p>

                <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-stone-700">
                  {legend.reflection}
                </p>
              </section>
            )}

            <Link
              href="/gallery"
              className="inline-block text-stone-600 underline-offset-4 transition-colors hover:text-stone-900 hover:underline"
            >
              ← Return to Gallery
            </Link>
          </article>
        )}
      </div>
    </main>
  );
}