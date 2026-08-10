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
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-10">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🌿</p>

          <h1 className="text-4xl font-light tracking-wide text-stone-800">
            Manage Studios
          </h1>

          <p className="mx-auto max-w-xl leading-7 text-stone-600">
            A quiet bit behind the Gallery.
          </p>
        </header>

        <div className="text-center">
          <Link
            href="/admin/studios/new"
            className="inline-flex items-center justify-center rounded-full bg-stone-800 px-8 py-3 text-sm text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98]"
          >
            + Create a Studio
          </Link>
        </div>

        {loading && (
          <p className="text-center italic text-stone-500">
            🌿 Gathering the Studios...
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}

        {!loading &&
          !errorMessage &&
          studios.length === 0 && (
            <p className="text-center text-stone-500">
              No Studios have been created yet.
            </p>
          )}

        {!loading &&
          !errorMessage &&
          studios.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

              <div className="grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_80px] items-center gap-6 border-b border-stone-200 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                <span>Studio</span>
                <span>Owner</span>
                <span></span>
              </div>

              {studios.map((studio) => (
                <div
                  key={studio.slug}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_80px] items-center gap-6 border-b border-stone-100 px-5 py-4 last:border-b-0"
                >

                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-xl">
                      {studio.icon || "🌿"}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-800">
                        {studio.name}
                      </p>

                      <p className="text-xs text-stone-400">
                        /{studio.slug}
                      </p>
                    </div>
                  </div>

                  <p className="truncate text-sm text-stone-600">
                    {studio.owner}
                  </p>

                  <div className="text-right">
                    <Link
                      href={`/studios/${studio.slug}`}
                      className="text-sm text-stone-500 transition-colors hover:text-stone-900"
                    >
                      Open →
                    </Link>
                  </div>

                </div>
              ))}

            </section>
          )}

        <footer className="text-center">
          <Link
            href="/account"
            className="text-sm text-stone-400 transition-colors hover:text-stone-700"
          >
            ← My Account
          </Link>
        </footer>

      </div>
    </main>
  );
}