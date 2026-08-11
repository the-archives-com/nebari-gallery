"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
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

type Filter =
  | "All Work"
  | "Photography"
  | "Artwork"
  | "Works in Progress";

const filters: Filter[] = [
  "All Work",
  "Photography",
  "Artwork",
  "Works in Progress",
];

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

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<Filter>("All Work");

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

      const names: StudioNameMap = {};

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

  const visibleArtwork =
    useMemo(() => {
      if (
        activeFilter ===
        "All Work"
      ) {
        return featuredArtwork;
      }

      return featuredArtwork.filter(
        (artwork) =>
          artwork.category ===
          activeFilter,
      );
    }, [
      activeFilter,
      featuredArtwork,
    ]);

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* TOP BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.14em]">

            <Link
              href="/"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Home
            </Link>

            <Link
              href="/gallery"
              aria-current="page"
              className="border-b-2 border-nebari-green pb-2 text-nebari-green"
            >
              Gallery
            </Link>

            <Link
              href="/studios"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Studios
            </Link>

          </nav>

        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">

        {/* HEADER */}

        <header className="mx-auto max-w-2xl text-center">

          <p className="nebari-brand text-xs text-nebari-maple">
            Studio Nebari
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink sm:text-6xl">
            Gallery
          </h1>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-nebari-maple/40" />
            <span className="text-sm text-nebari-maple">
              ◆
            </span>
            <span className="h-px w-12 bg-nebari-maple/40" />
          </div>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-nebari-muted">
            Selected work from personal Studios.
          </p>

        </header>

        {/* FILTERS */}

        <div className="mt-12 border-b border-nebari-border">

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">

            {filters.map(
              (filter) => {
                const active =
                  activeFilter ===
                  filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setActiveFilter(
                        filter,
                      )
                    }
                    className={`border-b-2 pb-3 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
                      active
                        ? "border-nebari-green text-nebari-green"
                        : "border-transparent text-nebari-muted hover:text-nebari-green"
                    }`}
                  >
                    {filter}
                  </button>
                );
              },
            )}

          </div>

        </div>

        {/* GALLERY */}

        <section className="mt-10">

          {loading && (
            <p className="text-center italic text-nebari-muted">
              Preparing the Gallery...
            </p>
          )}

          {errorMessage && (
            <p
              role="alert"
              className="rounded-2xl border border-nebari-maple/20 bg-nebari-surface p-5 text-center text-sm text-nebari-maple"
            >
              {errorMessage}
            </p>
          )}

          {!loading &&
            !errorMessage &&
            visibleArtwork.length ===
              0 && (
              <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-nebari-border bg-nebari-surface p-10 text-center">

                <p className="nebari-serif text-2xl text-nebari-ink">
                  No work here yet.
                </p>

                <p className="mt-3 text-sm leading-6 text-nebari-muted">
                  The walls are waiting
                  for their first piece.
                </p>

              </div>
            )}

          {!loading &&
            !errorMessage &&
            visibleArtwork.length >
              0 && (
              <div className="grid gap-7 sm:grid-cols-2">

                {visibleArtwork.map(
                  (artwork) => (
                    <Link
                      key={artwork.id}
                      href={`/studios/${artwork.studio_slug}/artwork/${artwork.id}`}
                      className="group overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >

                      <div className="overflow-hidden bg-nebari-paper/40">
                        <img
                          src={
                            artwork.image_url
                          }
                          alt={
                            artwork.title
                          }
                          className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                      </div>

                      <div className="space-y-3 p-5">

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">
                            <h2 className="nebari-serif truncate text-2xl font-medium text-nebari-ink">
                              {
                                artwork.title
                              }
                            </h2>

                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-nebari-green">
                              {artwork.category ??
                                "Selected Work"}
                            </p>
                          </div>

                          <span className="text-lg text-nebari-muted transition-colors group-hover:text-nebari-maple">
                            ☆
                          </span>

                        </div>

                        {artwork.description && (
                          <p className="line-clamp-2 text-sm leading-6 text-nebari-muted">
                            {
                              artwork.description
                            }
                          </p>
                        )}

                        <p className="pt-1 text-xs text-nebari-muted">
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

      </div>

      {/* DARK TIMBER-INSPIRED FOOTER */}

      <footer className="border-t border-[#2b211c] bg-[#3b2f2a]">
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