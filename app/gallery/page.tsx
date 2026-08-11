"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

type FeaturedArtwork = {
  id: number;
  created_at: string;
  studio_slug: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
};

type StudioNameMap = {
  [slug: string]: string;
};

export default function GalleryPage() {
  const [
    featuredArtwork,
    setFeaturedArtwork,
  ] = useState<FeaturedArtwork[]>([]);

  const [
    studioNames,
    setStudioNames,
  ] = useState<StudioNameMap>({});

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    async function loadGallery() {
      setLoading(true);
      setErrorMessage("");

      const [
        artworkResult,
        studioResult,
      ] = await Promise.all([
        supabase
          .from("studio_artworks")
          .select(
            "id, created_at, studio_slug, title, description, image_url, category",
          )
          .eq(
            "gallery_status",
            "featured",
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("studios")
          .select("slug, name"),
      ]);

      if (artworkResult.error) {
        console.error(
          "Could not load Nebari Gallery:",
          artworkResult.error,
        );

        setErrorMessage(
          "The Gallery could not be loaded.",
        );

        setLoading(false);
        return;
      }

      if (studioResult.error) {
        console.error(
          "Could not load Studio names:",
          studioResult.error,
        );
      }

      const names: StudioNameMap =
        {};

      for (
        const studio of
          studioResult.data ?? []
      ) {
        names[studio.slug] =
          studio.name;
      }

      setStudioNames(names);

      setFeaturedArtwork(
        artworkResult.data ?? [],
      );

      setLoading(false);
    }

    loadGallery();
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-14">

        <header className="space-y-4 text-center">
          <p className="text-3xl">
            🌿
          </p>

          <h1 className="text-4xl font-light tracking-wide sm:text-6xl">
            Nebari Gallery
          </h1>

          <p className="mx-auto max-w-2xl text-stone-600">
            A shared gallery of creative work
            from personal Studios.
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
            aria-current="page"
            className="flex min-h-12 items-center justify-center rounded-full bg-stone-800 px-5 py-3 text-sm text-stone-50"
          >
            Gallery
          </Link>

          <Link
            href="/studios"
            className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 transition-all hover:bg-stone-100"
          >
            Studios
          </Link>
        </nav>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-light text-stone-800">
              The Gallery
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Selected work from across the neighbourhood.
            </p>
          </div>

          {loading && (
            <p className="text-center italic text-stone-500">
              🌿 Preparing the Gallery...
            </p>
          )}

          {errorMessage && (
            <p
              role="alert"
              className="text-center text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {!loading &&
            !errorMessage &&
            featuredArtwork.length ===
              0 && (
              <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
                <p className="text-3xl">
                  🖼️
                </p>

                <p className="mt-4 text-stone-500">
                  The Gallery is waiting
                  for its first selection.
                </p>
              </div>
            )}

          {!loading &&
            !errorMessage &&
            featuredArtwork.length >
              0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredArtwork.map(
                  (artwork) => (
                    <Link
                      key={artwork.id}
                      href={`/studios/${artwork.studio_slug}/artwork/${artwork.id}`}
                      className="block overflow-hidden rounded-xl bg-white p-3 pb-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="overflow-hidden rounded bg-stone-100">
                        <img
                          src={
                            artwork.image_url
                          }
                          alt={
                            artwork.title
                          }
                          className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </div>

                      <div className="px-2 pt-4">
                        <h3 className="text-lg font-medium text-stone-800">
                          {
                            artwork.title
                          }
                        </h3>

                        {artwork.category && (
                          <p className="mt-1 text-xs uppercase tracking-wider text-stone-400">
                            {
                              artwork.category
                            }
                          </p>
                        )}

                        {artwork.description && (
                          <p className="mt-3 text-sm leading-6 text-stone-500">
                            {
                              artwork.description
                            }
                          </p>
                        )}

                        <p className="mt-5 text-xs text-stone-400">
                          From{" "}
                          {studioNames[
                            artwork
                              .studio_slug
                          ] ??
                            artwork
                              .studio_slug}
                        </p>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
        </section>

        <footer className="pt-6 text-center text-sm italic text-stone-400">
          An idea grown at Studio Nebari.
        </footer>

      </div>
    </main>
  );
}