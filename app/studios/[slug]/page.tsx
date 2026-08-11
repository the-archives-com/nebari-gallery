"use client";

import Link from "next/link";
import {
  useParams,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

  const [isOwner, setIsOwner] =
    useState(false);

  const [activeFilter, setActiveFilter] =
    useState<Filter>("All Work");

  useEffect(() => {
    async function loadStudio() {
      setLoading(true);
      setNotFound(false);
      setIsOwner(false);

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

      const [
        artworkResult,
        userResult,
      ] = await Promise.all([
        supabase
          .from("studio_artworks")
          .select("*")
          .eq(
            "studio_slug",
            params.slug,
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase.auth.getUser(),
      ]);

      if (artworkResult.error) {
        console.error(
          "Could not load artwork:",
          artworkResult.error,
        );

        setArtworks([]);
      } else {
        setArtworks(
          artworkResult.data ?? [],
        );
      }

      const user =
        userResult.data.user;

      if (user) {
        const {
          data: membership,
          error: membershipError,
        } = await supabase
          .from("studio_members")
          .select("role")
          .eq("user_id", user.id)
          .eq(
            "studio_slug",
            params.slug,
          )
          .eq("role", "owner")
          .maybeSingle();

        if (membershipError) {
          console.error(
            "Could not check Studio ownership:",
            membershipError,
          );
        }

        setIsOwner(
          Boolean(membership),
        );
      }

      setLoading(false);
    }

    loadStudio();
  }, [params.slug]);

  /*
   * FILTER THE STUDIO WALL
   */

  const visibleArtwork =
    useMemo(() => {
      if (
        activeFilter === "All Work"
      ) {
        return artworks;
      }

      return artworks.filter(
        (artwork) => {
          const category =
            artwork.category
              ?.trim()
              .toLowerCase() ?? "";

          if (
            activeFilter ===
            "Photography"
          ) {
            return (
              category ===
                "photography" ||
              category === "photo"
            );
          }

          if (
            activeFilter ===
            "Artwork"
          ) {
            return (
              category === "artwork" ||
              category === "drawing" ||
              category === "painting"
            );
          }

          if (
            activeFilter ===
            "Works in Progress"
          ) {
            return (
              category ===
                "works in progress" ||
              category ===
                "work in progress" ||
              category ===
                "in progress"
            );
          }

          return false;
        },
      );
    }, [activeFilter, artworks]);

  /*
   * LOADING
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">

        <p className="text-center italic text-nebari-muted">
          Opening the Studio...
        </p>

      </main>
    );
  }

  /*
   * STUDIO NOT FOUND
   */

  if (notFound || !studio) {
    return (
      <main className="min-h-screen bg-background text-foreground">

        <div className="border-b border-nebari-border bg-nebari-surface/70">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

            <Link
              href="/"
              className="nebari-brand text-sm font-medium text-nebari-ink"
            >
              Studio Nebari
            </Link>

            <Link
              href="/studios"
              className="text-xs font-medium uppercase tracking-[0.14em] text-nebari-muted hover:text-nebari-green"
            >
              Studios
            </Link>

          </div>
        </div>

        <div className="mx-auto max-w-xl px-6 py-24 text-center">

          <h1 className="nebari-serif text-4xl font-medium text-nebari-ink">
            This Studio hasn&apos;t opened yet.
          </h1>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <Link
            href="/studios"
            className="mt-8 inline-block text-sm text-nebari-green transition-colors hover:text-nebari-maple"
          >
            ← Return to Studios
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* TOP BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">

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
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Gallery
            </Link>

            <Link
              href="/studios"
              className="border-b-2 border-nebari-green pb-2 text-nebari-green"
            >
              Studios
            </Link>

          </nav>

        </div>

      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">

        {/* STUDIO HEADER */}

        <header className="mx-auto max-w-3xl text-center">

          <p className="nebari-brand text-xs text-nebari-maple">
            Personal Studio
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink sm:text-6xl">
            {studio.name}
          </h1>

          {studio.owner && (
            <p className="mt-4 text-sm text-nebari-muted">
              A Studio by {studio.owner}
            </p>
          )}

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

        </header>

        {/* ABOUT */}

        {studio.description && (
          <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-nebari-border bg-nebari-surface px-8 py-7 shadow-sm">

            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-green">
              About
            </p>

            <p className="mt-4 leading-8 text-nebari-muted">
              {studio.description}
            </p>

          </section>
        )}

        {/* OWNER CONTROL */}

        {isOwner && (
          <div className="mt-8 flex justify-center">

            <Link
              href={`/studios/${studio.slug}/upload`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-nebari-green px-8 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              + Hang Artwork
            </Link>

          </div>
        )}

        {/* STUDIO WALL */}

        <section className="mt-20">

          <div className="text-center">

            <h2 className="nebari-serif text-4xl font-medium text-nebari-ink">
              The Studio Wall
            </h2>

            <p className="mt-3 text-sm text-nebari-muted">
              A growing collection of work.
            </p>

          </div>

          {/* FILTER HEADINGS */}

          {artworks.length > 0 && (
            <div className="mt-10 border-b border-nebari-border">

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
          )}

          {/* EMPTY STUDIO */}

          {artworks.length === 0 && (
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-nebari-border bg-nebari-surface p-10 text-center">

              <p className="nebari-serif text-2xl text-nebari-ink">
                The walls are waiting.
              </p>

              <p className="mt-3 text-sm leading-6 text-nebari-muted">
                This Studio has not hung its first piece yet.
              </p>

            </div>
          )}

          {/* EMPTY FILTER */}

          {artworks.length > 0 &&
            visibleArtwork.length === 0 && (
              <div className="mx-auto mt-10 max-w-md py-10 text-center">

                <p className="nebari-serif text-xl text-nebari-ink">
                  Nothing on this wall yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      "All Work",
                    )
                  }
                  className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-nebari-green transition-colors hover:text-nebari-maple"
                >
                  View All Work →
                </button>

              </div>
            )}

          {/* ARTWORK GRID */}

          {visibleArtwork.length > 0 && (
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

              {visibleArtwork.map(
                (artwork) => (
                  <Link
                    key={artwork.id}
                    href={`/studios/${studio.slug}/artwork/${artwork.id}`}
                    className={`
                      group
                      overflow-hidden
                      rounded-2xl
                      border
                      border-nebari-border
                      bg-nebari-surface
                      shadow-sm
                      transition-all
                      duration-500
                      hover:-translate-y-1
                      hover:shadow-xl
                      ${
                        justHungId ===
                        String(
                          artwork.id,
                        )
                          ? "ring-2 ring-nebari-sage shadow-xl"
                          : ""
                      }
                    `}
                  >

                    <div className="overflow-hidden bg-nebari-paper/40">

                      <img
                        src={
                          artwork.image_url
                        }
                        alt={
                          artwork.title
                        }
                        className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />

                    </div>

                    <div className="p-5">

                      <h3 className="nebari-serif text-xl font-medium text-nebari-ink">
                        {artwork.title}
                      </h3>

                      {artwork.category && (
                        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-nebari-green">
                          {artwork.category}
                        </p>
                      )}

                      {artwork.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-nebari-muted">
                          {
                            artwork.description
                          }
                        </p>
                      )}

                    </div>

                  </Link>
                ),
              )}

            </div>
          )}

        </section>

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