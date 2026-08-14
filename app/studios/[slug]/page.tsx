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
import StudioPlantMark from "../../components/StudioPlantMark";

import {
  resolveStudioAccent,
} from "../../../lib/studio-accents";


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

  const [isSignedIn, setIsSignedIn] =
    useState(false);

  const [isFavourite, setIsFavourite] =
    useState(false);

  const [favouriteBusy, setFavouriteBusy] =
    useState(false);

  const [favouriteMessage, setFavouriteMessage] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<Filter>("All Work");

  useEffect(() => {
    async function loadStudio() {
      setLoading(true);
      setNotFound(false);
      setIsOwner(false);
      setIsSignedIn(false);
      setIsFavourite(false);
      setFavouriteMessage("");

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
        setIsSignedIn(true);

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

        const {
          data: favourite,
          error: favouriteError,
        } = await supabase
          .from("studio_favourites")
          .select("studio_slug")
          .eq("user_id", user.id)
          .eq("studio_slug", params.slug)
          .maybeSingle();

        if (favouriteError) {
          console.error(
            "Could not check favourite Studio:",
            favouriteError,
          );
        }

        setIsFavourite(Boolean(favourite));
      }

      setLoading(false);
    }

    loadStudio();
  }, [params.slug]);

  async function handleFavourite() {
    if (!isSignedIn) {
      window.location.href = "/login";
      return;
    }

    setFavouriteBusy(true);
    setFavouriteMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const result = isFavourite
      ? await supabase
          .from("studio_favourites")
          .delete()
          .eq("user_id", user.id)
          .eq("studio_slug", params.slug)
      : await supabase
          .from("studio_favourites")
          .insert({
            user_id: user.id,
            studio_slug: params.slug,
          });

    if (result.error) {
      console.error(
        "Could not update favourite Studio:",
        result.error,
      );
      setFavouriteMessage(
        "Your favourites could not be updated. Please try again.",
      );
    } else {
      setIsFavourite(!isFavourite);
    }

    setFavouriteBusy(false);
  }

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

  const studioAccent =
  resolveStudioAccent(
    studio.colour,
  );

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

       {/* STUDIO ENTRANCE */}

<div className="relative mx-auto max-w-4xl overflow-visible rounded-[2rem] border border-nebari-border bg-nebari-surface shadow-sm">

  {/* QUIET TOP BAND */}

  <div className="border-b border-nebari-border bg-nebari-paper/30 px-8 py-4 text-center">

    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nebari-muted">
      Personal Studio · Nebari Gallery
    </p>

  </div>

  {/* NAMEPLATE */}

  <header className="px-8 py-12 text-center sm:px-12 sm:py-14">

    <p className="nebari-brand text-xs text-nebari-maple">
      The Studio of
    </p>

    <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink sm:text-6xl">
      {studio.name}
    </h1>

    {studio.owner && (
      <p className="mt-4 text-sm tracking-wide text-nebari-muted">
        {studio.owner}
      </p>
    )}

    <div className="mx-auto mt-7 flex items-center justify-center gap-3">

      <span className="h-px w-14 bg-nebari-maple/40" />

      <span
        className="text-sm"
        style={{
          color: studioAccent.colour,
        }}
      >
        ◆
      </span>

      <span className="h-px w-14 bg-nebari-maple/40" />

    </div>

    {/* DESCRIPTION */}

    {studio.description ? (
      <div className="mx-auto mt-8 max-w-2xl">

        <p className="whitespace-pre-wrap text-base leading-8 text-nebari-muted">
          {studio.description}
        </p>

      </div>
    ) : isOwner ? (
      <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-dashed border-nebari-border bg-background/50 px-7 py-6">

        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nebari-maple">
          Your Studio
        </p>

        <p className="nebari-serif mt-3 text-xl text-nebari-ink">
          Make this Studio yours.
        </p>

        <p className="mt-2 text-sm leading-6 text-nebari-muted">
          Add a few words about what you&apos;re making,
          exploring or noticing at the moment.
        </p>

        <Link
          href={`/studios/${studio.slug}/edit`}
          className="mt-4 inline-block text-sm text-nebari-green transition-colors hover:text-nebari-maple"
        >
          Add an introduction →
        </Link>

      </div>
    ) : null}

  </header>

  {/* STUDIO THRESHOLD */}

  <div className="border-t border-nebari-border bg-nebari-paper/30 px-8 py-4">

    <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
      Step inside · Look around · Follow the work
    </p>

  </div>

  {/* STUDIO PLANT SIGNATURE */}

  <StudioPlantMark
    plant={studioAccent.mark}
    colour={studioAccent.colour}
    name={studioAccent.name}
    className="absolute right-6 top-16 scale-125"
  />

</div>


        {/* OWNER CONTROLS */}

        {isOwner && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <Link
              href={`/studios/${studio.slug}/edit`}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-nebari-border bg-nebari-surface px-8 py-3 text-xs font-medium uppercase tracking-[0.12em] text-nebari-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-nebari-sage hover:shadow-md active:translate-y-0"
            >
              Edit Studio
            </Link>

            <Link
              href={`/studios/${studio.slug}/upload`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-nebari-green px-8 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              + Hang Artwork
            </Link>

          </div>
        )}

        {!isOwner && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleFavourite}
              disabled={favouriteBusy}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-nebari-green bg-nebari-surface px-8 py-3 text-xs font-medium uppercase tracking-[0.12em] text-nebari-green transition-all duration-300 hover:-translate-y-0.5 hover:bg-nebari-green hover:text-white hover:shadow-md disabled:cursor-wait disabled:opacity-60"
            >
              {favouriteBusy
                ? "Saving..."
                : isFavourite
                  ? "♥ Favourited"
                  : isSignedIn
                    ? "♡ Add to Favourites"
                    : "Sign in to Favourite"}
            </button>

            {favouriteMessage && (
              <p
                role="status"
                className="mt-3 text-sm text-nebari-maple"
              >
                {favouriteMessage}
              </p>
            )}
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

            <span
              className="text-sm"
              style={{
                color: studioAccent.colour,
              }}
            >
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
