"use client";

import Link from "next/link";
import {
  useParams,
  useSearchParams,
} from "next/navigation";
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

type Artwork = {
  id: number;
  created_at: string;
  studio_slug: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
};

export default function StudioPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const justHungId =
    searchParams.get("justHung");

  const [studio, setStudio] =
    useState<Studio | null>(null);

  const [artworks, setArtworks] =
    useState<Artwork[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [notFound, setNotFound] =
    useState(false);

  useEffect(() => {
    async function loadStudio() {
      setLoading(true);
      setNotFound(false);

      const {
        data: studioData,
        error: studioError,
      } = await supabase
        .from("studios")
        .select(
          "slug, name, owner, description, icon, colour",
        )
        .eq("slug", params.slug)
        .maybeSingle();

      if (studioError) {
        console.error(
          "Could not load Studio:",
          studioError,
        );

        setNotFound(true);
        setLoading(false);
        return;
      }

      if (!studioData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setStudio(studioData);

      const {
        data: artworkData,
        error: artworkError,
      } = await supabase
        .from("studio_artworks")
        .select("*")
        .eq("studio_slug", params.slug)
        .order("created_at", {
          ascending: false,
        });

      if (artworkError) {
        console.error(
          "Could not load artwork:",
          artworkError,
        );

        setArtworks([]);
        setLoading(false);
        return;
      }

      setArtworks(artworkData ?? []);
      setLoading(false);
    }

    loadStudio();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <p className="text-center italic text-stone-500">
          🌿 Opening the Studio...
        </p>
      </main>
    );
  }

  if (notFound || !studio) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <div className="mx-auto max-w-xl space-y-8 text-center">
          <p className="text-4xl">
            🌱
          </p>

          <h1 className="text-3xl font-light text-stone-800">
            This Studio hasn&apos;t opened yet.
          </h1>

          <Link
            href="/studios"
            className="text-stone-600 hover:text-stone-900"
          >
            ← Return to Studios
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">

        <nav className="flex justify-center">
          <Link
            href="/studios"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            ← Studios
          </Link>
        </nav>

        <header className="mx-auto max-w-2xl space-y-5 text-center">
          <p className="text-4xl">
            {studio.icon || "🌿"}
          </p>

          <h1 className="text-4xl font-light tracking-wide text-stone-800 sm:text-6xl">
            {studio.name}
          </h1>

          {studio.owner && (
            <p className="text-sm text-stone-400">
              A Studio by {studio.owner}
            </p>
          )}

          {studio.description && (
            <p className="text-lg leading-8 text-stone-600">
              {studio.description}
            </p>
          )}
        </header>

        {studio.description && (
          <section className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-widest text-stone-400">
              About
            </p>

            <p className="mt-5 leading-8 text-stone-700">
              {studio.description}
            </p>
          </section>
        )}

        <div className="flex justify-center">
          <Link
            href={`/studios/${studio.slug}/upload`}
            className="
              inline-flex
              min-h-12
              items-center
              justify-center
              rounded-full
              bg-stone-800
              px-8
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
            ＋ Hang Artwork
          </Link>
        </div>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-light text-stone-800">
              The Studio Wall
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              A growing collection of work.
            </p>
          </div>

          {artworks.length === 0 && (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
              <p className="text-3xl">
                {studio.icon || "🌿"}
              </p>

              <p className="mt-4 text-stone-500">
                The walls are waiting for their first piece.
              </p>
            </div>
          )}

          {artworks.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artworks.map((artwork) => (
                <article
                  key={artwork.id}
                  className={`
                    overflow-hidden
                    rounded-xl
                    bg-white
                    p-3
                    pb-6
                    shadow-lg
                    transition-all
                    duration-1000
                    hover:-translate-y-1
                    hover:shadow-2xl
                    ${
                      justHungId ===
                      String(artwork.id)
                        ? "scale-[1.02] ring-4 ring-stone-300 shadow-2xl"
                        : ""
                    }
                  `}
                >
                  <Link
                    href={`/studios/${studio.slug}/artwork/${artwork.id}`}
                    className="block"
                  >
                    <div className="overflow-hidden rounded bg-stone-100">
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>

                    <div className="px-2 pt-4">
                      <h3 className="text-lg font-medium text-stone-800">
                        {artwork.title}
                      </h3>

                      {artwork.category && (
                        <p className="mt-1 text-xs uppercase tracking-wider text-stone-400">
                          {artwork.category}
                        </p>
                      )}

                      {artwork.description && (
                        <p className="mt-3 text-sm leading-6 text-stone-500">
                          {artwork.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="text-center">
          <p className="text-sm italic text-stone-400">
            A quiet place for meaningful work.
          </p>
        </footer>

      </div>
    </main>
  );
}