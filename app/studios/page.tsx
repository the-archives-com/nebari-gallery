"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import StudioPlantMark from "../components/StudioPlantMark";

import { supabase } from "../../lib/supabase";

import {
  resolveStudioAccent,
} from "../../lib/studio-accents";

type Studio = {
  slug: string;
  name: string;
  owner: string;
  description: string | null;
  icon: string | null;
  colour: string | null;
};

type RecentArtwork = {
  id: number;
  created_at: string;
  studio_slug: string;
  title: string;
  image_url: string;
  category: string | null;
  gallery_status: string | null;
};

type StudioNameMap = {
  [slug: string]: string;
};

type StudioOwnerMap = {
  [slug: string]: string;
};

export default function StudiosPage() {
  const [studios, setStudios] =
    useState<Studio[]>([]);

  const [artworks, setArtworks] =
    useState<RecentArtwork[]>([]);

  const [studioNames, setStudioNames] =
    useState<StudioNameMap>({});

  const [studioOwners, setStudioOwners] =
    useState<StudioOwnerMap>({});

  const [ownedStudioSlugs, setOwnedStudioSlugs] =
    useState<string[]>([]);

  const [favouriteStudioSlugs, setFavouriteStudioSlugs] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadStudios() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [
        studioResult,
        artworkResult,
      ] = await Promise.all([
        supabase
          .from("studios")
          .select(
            "slug, name, owner, description, icon, colour",
          )
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("studio_artworks")
          .select(
            "id, created_at, studio_slug, title, image_url, category, gallery_status",
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(100),
      ]);

      if (user) {
        const [membershipResult, favouriteResult] =
          await Promise.all([
            supabase
              .from("studio_members")
              .select("studio_slug, role")
              .eq("user_id", user.id)
              .eq("role", "owner"),
            supabase
              .from("studio_favourites")
              .select("studio_slug")
              .eq("user_id", user.id),
          ]);

        if (membershipResult.error) {
          console.error(
            "Could not load owned Studios:",
            membershipResult.error,
          );
        } else {
          setOwnedStudioSlugs(
            (membershipResult.data ?? [])
              .map((membership) => membership.studio_slug)
              .filter((slug) => slug !== "nebari"),
          );
        }

        if (favouriteResult.error) {
          console.error(
            "Could not load favourite Studios:",
            favouriteResult.error,
          );
        } else {
          setFavouriteStudioSlugs(
            (favouriteResult.data ?? []).map(
              (favourite) => favourite.studio_slug,
            ),
          );
        }
      }

      if (studioResult.error) {
        console.error(
          "Could not load Studios:",
          studioResult.error,
        );

        setErrorMessage(
          "The Studios could not be loaded.",
        );

        setLoading(false);
        return;
      }

      if (artworkResult.error) {
        console.log(
          "Recent Studio work error details:",
          {
            message:
              artworkResult.error.message,

            details:
              artworkResult.error.details,

            hint:
              artworkResult.error.hint,

            code:
              artworkResult.error.code,
          },
        );
      }

      const loadedStudios =
        studioResult.data ?? [];

      const names: StudioNameMap = {};
      const owners: StudioOwnerMap = {};

      for (const studio of loadedStudios) {
        names[studio.slug] =
          studio.name;

        owners[studio.slug] =
          studio.owner ||
          studio.name;
      }

      setStudios(
        loadedStudios,
      );

      setStudioNames(
        names,
      );

      setStudioOwners(
        owners,
      );

      setArtworks(
        artworkResult.data ?? [],
      );

      setLoading(false);
    }

    loadStudios();
  }, []);

  /*
   * IN THE STUDIOS
   *
   * One recent non-Gallery piece from each Studio.
   *
   * Because artworks arrive newest-first,
   * the first suitable piece we encounter
   * for each Studio is that Studio's newest one.
   */

  const studioActivity =
    useMemo(() => {
      const selected =
        new Map<
          string,
          RecentArtwork
        >();

      for (
        const artwork of artworks
      ) {
        if (
          artwork.gallery_status ===
          "featured"
        ) {
          continue;
        }

        if (
          !selected.has(
            artwork.studio_slug,
          )
        ) {
          selected.set(
            artwork.studio_slug,
            artwork,
          );
        }

        if (
          selected.size >= 6
        ) {
          break;
        }
      }

      return Array.from(
        selected.values(),
      );
    }, [artworks]);

  /*
   * PERSONALISED DIRECTORY
   *
   * A signed-in artist sees their own Studio first,
   * followed by favourites, then all other Studios.
   * Within each group, Studios remain alphabetical.
   */

  const orderedStudios =
    useMemo(() => {
      const owned = new Set(ownedStudioSlugs);
      const favourites = new Set(favouriteStudioSlugs);

      function priority(slug: string) {
        if (owned.has(slug)) {
          return 0;
        }

        if (favourites.has(slug)) {
          return 1;
        }

        return 2;
      }

      return [...studios].sort((a, b) => {
        const priorityDifference =
          priority(a.slug) - priority(b.slug);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return a.name.localeCompare(b.name);
      });
    }, [
      favouriteStudioSlugs,
      ownedStudioSlugs,
      studios,
    ]);

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* TOP BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

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
              aria-current="page"
              className="border-b-2 border-nebari-green pb-2 text-nebari-green"
            >
              Studios
            </Link>

          </nav>

        </div>

      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">

        {/* HEADER */}

        <header className="mx-auto max-w-2xl text-center">

          <p className="nebari-brand text-xs text-nebari-maple">
            Studio Nebari
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink sm:text-6xl">
            Studios
          </h1>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-nebari-muted">
            Quiet corners for meaningful work.
          </p>

        </header>

        {/* LOADING */}

        {loading && (
          <p className="mt-14 text-center italic text-nebari-muted">
            Gathering the Studios...
          </p>
        )}

        {/* ERROR */}

        {errorMessage && (
          <p
            role="alert"
            className="mt-14 rounded-2xl border border-nebari-maple/20 bg-nebari-surface p-5 text-center text-sm text-nebari-maple"
          >
            {errorMessage}
          </p>
        )}

        {!loading &&
          !errorMessage && (
            <>

              {/* IN THE STUDIOS */}

              {studioActivity.length >
                0 && (
                <section className="mt-16">

                  <div className="mb-7 flex items-end justify-between gap-6 border-b border-nebari-border pb-4">

                    <div>

                      <h2 className="nebari-serif text-3xl font-medium text-nebari-ink">
                        In the Studios
                      </h2>

                      <p className="mt-1 text-sm text-nebari-muted">
                        A glimpse of what people are working on.
                      </p>

                    </div>

                    <p className="hidden text-xs uppercase tracking-[0.14em] text-nebari-muted sm:block">
                      From around Nebari
                    </p>

                  </div>

                  <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">

                    {studioActivity.map(
                      (artwork) => (
                        <article
                          key={artwork.id}
                          className="group min-w-0"
                        >

                          {/* IMAGE + HOVER */}

                          <div className="relative overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">

                            <img
                              src={
                                artwork.image_url
                              }
                              alt={
                                artwork.title
                              }
                              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />

                            {/* DESKTOP HOVER */}

                            <div className="absolute inset-0 hidden flex-col justify-end bg-[#2b211c]/80 p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">

                              <p className="text-xs uppercase tracking-[0.16em] text-[#e8e1d5]/70">
                                In the Studio
                              </p>

                              <p className="nebari-serif mt-2 text-xl text-[#fffdf8]">
                                {studioOwners[
                                  artwork
                                    .studio_slug
                                ] ??
                                  studioNames[
                                    artwork
                                      .studio_slug
                                  ] ??
                                  artwork
                                    .studio_slug}
                              </p>

                              <div className="mt-5 flex flex-wrap gap-2">

                                <Link
                                  href={`/studios/${artwork.studio_slug}/artwork/${artwork.id}`}
                                  className="rounded-full border border-[#e8e1d5]/50 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#fffdf8] transition-colors hover:bg-[#fffdf8] hover:text-[#3b2f2a]"
                                >
                                  View Image
                                </Link>

                                <Link
                                  href={`/studios/${artwork.studio_slug}`}
                                  className="rounded-full bg-[#224a24] px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#fffdf8] transition-colors hover:bg-[#5f715e]"
                                >
                                  Visit Studio
                                </Link>

                              </div>

                            </div>

                            {/* MOBILE IMAGE LINK */}

                            <Link
                              href={`/studios/${artwork.studio_slug}/artwork/${artwork.id}`}
                              className="absolute inset-0 sm:hidden"
                              aria-label={`View ${artwork.title}`}
                            />

                          </div>

                          {/* CAPTION */}

                          <div className="px-1 pt-3">

                            <Link
                              href={`/studios/${artwork.studio_slug}/artwork/${artwork.id}`}
                              className="nebari-serif block truncate text-lg font-medium text-nebari-ink transition-colors hover:text-nebari-green"
                            >
                              {artwork.title}
                            </Link>

                            <Link
                              href={`/studios/${artwork.studio_slug}`}
                              className="mt-1 block truncate text-xs text-nebari-muted transition-colors hover:text-nebari-green"
                            >
                              {studioOwners[
                                artwork
                                  .studio_slug
                              ] ??
                                studioNames[
                                  artwork
                                    .studio_slug
                                ] ??
                                artwork
                                  .studio_slug}

                              {" · "}

                              {studioNames[
                                artwork
                                  .studio_slug
                              ] ??
                                artwork
                                  .studio_slug}
                            </Link>

                          </div>

                        </article>
                      ),
                    )}

                  </div>

                </section>
              )}

              {/* STUDIO DIRECTORY */}

              <section className="mt-20">

                <div className="mb-7 border-b border-nebari-border pb-4">

                  <h2 className="nebari-serif text-3xl font-medium text-nebari-ink">
                    Studio Directory
                  </h2>

                  <p className="mt-1 text-sm text-nebari-muted">
                    Open a door and see what someone is making.
                  </p>

                </div>

                {studios.length === 0 ? (
                  <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-nebari-border bg-nebari-surface p-10 text-center">

                    <p className="nebari-serif text-2xl text-nebari-ink">
                      No Studios have opened yet.
                    </p>

                    <p className="mt-3 text-sm leading-6 text-nebari-muted">
                      The doors are quiet for now.
                    </p>

                  </div>
                ) : (
                  <>

                    {/* COLUMN HEADINGS */}

                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_48px] gap-6 px-5 pb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-muted">

                      <span>
                        Studio
                      </span>

                      <span>
                        Artist
                      </span>

                      <span />

                    </div>

                    {/* STUDIO ROWS */}

                    <div className="space-y-3">

                      {orderedStudios.map(
                        (studio) => {
                          const accent =
                            resolveStudioAccent(
                              studio.colour,
                            );

                          const isOwned =
                            ownedStudioSlugs.includes(
                              studio.slug,
                            );

                          const isFavourite =
                            !isOwned &&
                            favouriteStudioSlugs.includes(
                              studio.slug,
                            );

                          return (
                            <Link
                              key={
                                studio.slug
                              }
                              href={`/studios/${studio.slug}`}
                              className="group grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_48px] items-center gap-6 rounded-2xl border border-nebari-border bg-nebari-surface px-5 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-nebari-sage hover:shadow-lg"
                            >

                              {/* STUDIO IDENTITY */}

                              <div className="flex min-w-0 items-center gap-4">

                                <div
                                  className="flex h-10 w-10 shrink-0 items-center justify-center"
                                  title={
                                    accent.name
                                  }
                                >
                                  <StudioPlantMark
                                    plant={
                                      accent.mark
                                    }
                                    colour={
                                      accent.colour
                                    }
                                  />
                                </div>

                                <div className="min-w-0">

                                  <div className="flex min-w-0 flex-wrap items-center gap-2">

                                    <p className="nebari-serif truncate text-xl font-medium text-nebari-ink">
                                      {studio.name}
                                    </p>

                                    {isOwned && (
                                      <span className="rounded-full bg-nebari-green px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white">
                                        Your Studio
                                      </span>
                                    )}

                                    {isFavourite && (
                                      <span className="rounded-full border border-nebari-maple/40 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-nebari-maple">
                                        Favourite
                                      </span>
                                    )}

                                  </div>

                                  {studio.description && (
                                    <p className="mt-1 truncate text-sm text-nebari-muted">
                                      {studio.description}
                                    </p>
                                  )}

                                </div>

                              </div>

                              {/* ARTIST */}

                              <p className="truncate text-sm text-nebari-muted">
                                {studio.owner ||
                                  "—"}
                              </p>

                              {/* OPEN */}

                              <div className="text-right">

                                <span className="text-xl text-nebari-ink transition-all duration-300 group-hover:translate-x-1 group-hover:text-nebari-green">
                                  →
                                </span>

                              </div>

                            </Link>
                          );
                        },
                      )}

                    </div>

                  </>
                )}

              </section>

            </>
          )}

      </div>

      {/* DARK TIMBER FOOTER */}

      <footer className="mt-10 border-t border-[#2b211c] bg-[#3b2f2a]">

        <div className="mx-auto max-w-5xl px-6 py-10 text-center">

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
