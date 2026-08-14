"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

type Artwork = {
  id: number;
  created_at: string;
  studio_slug: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  gallery_status: string | null;
};

type StudioNameMap = {
  [slug: string]: string;
};

type GalleryAction =
  | "approve"
  | "decline"
  | "feature"
  | "remove";

export default function GalleryCurationPage() {
  const [
    artworks,
    setArtworks,
  ] = useState<Artwork[]>([]);

  const [
    studioNames,
    setStudioNames,
  ] = useState<StudioNameMap>({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    savingId,
    setSavingId,
  ] = useState<number | null>(
    null,
  );

  /*
   * LOAD ALL STUDIO WORK
   */

  useEffect(() => {
    async function loadCuration() {
      setLoading(true);
      setErrorMessage("");

      const [
        artworkResult,
        studioResult,
      ] = await Promise.all([
        supabase
          .from("studio_artworks")
          .select(
            "id, created_at, studio_slug, title, description, image_url, category, gallery_status",
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          ),

        supabase
          .from("studios")
          .select(
            "slug, name",
          )
          .order(
            "name",
            {
              ascending: true,
            },
          ),
      ]);

      if (
        artworkResult.error
      ) {
        console.error(
          "Could not load artwork for curation:",
          artworkResult.error,
        );

        setErrorMessage(
          "Studio artwork could not be loaded.",
        );

        setLoading(false);
        return;
      }

      const names:
        StudioNameMap = {};

      for (
        const studio of
          studioResult.data ?? []
      ) {
        names[
          studio.slug
        ] = studio.name;
      }

      setStudioNames(
        names,
      );

      setArtworks(
        artworkResult.data ??
          [],
      );

      setLoading(false);
    }

    loadCuration();
  }, []);

  /*
   * GROUP WORK BY GALLERY STATUS
   */

  const awaitingReview =
    useMemo(
      () =>
        artworks.filter(
          (artwork) =>
            artwork.gallery_status ===
            "pending",
        ),
      [artworks],
    );

  const studioWork =
    useMemo(
      () =>
        artworks.filter(
          (artwork) =>
            artwork.gallery_status ===
              "not_featured" ||
            artwork.gallery_status ===
              null,
        ),
      [artworks],
    );

  const featuredWork =
    useMemo(
      () =>
        artworks.filter(
          (artwork) =>
            artwork.gallery_status ===
            "featured",
        ),
      [artworks],
    );

  const declinedWork =
    useMemo(
      () =>
        artworks.filter(
          (artwork) =>
            artwork.gallery_status ===
            "declined",
        ),
      [artworks],
    );

  /*
   * CURATION ACTION
   */

  async function changeStatus(
    artworkId: number,
    action: GalleryAction,
  ) {
    setSavingId(
      artworkId,
    );

    setMessage("");
    setErrorMessage("");

    const {
      data: sessionData,
    } =
      await supabase.auth.getSession();

    const accessToken =
      sessionData.session
        ?.access_token;

    if (!accessToken) {
      setErrorMessage(
        "Your session has ended. Please sign in again.",
      );

      setSavingId(null);
      return;
    }

    try {
      const response =
        await fetch(
          "/api/admin/gallery-submission",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify({
                artworkId,
                action,
              }),
          },
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "The Gallery could not be updated.",
        );
      }

      setArtworks(
        (current) =>
          current.map(
            (artwork) =>
              artwork.id ===
              artworkId
                ? {
                    ...artwork,

                    gallery_status:
                      result.galleryStatus,
                  }
                : artwork,
          ),
      );

      if (
        result.galleryStatus ===
        "featured"
      ) {
        setMessage(
          "Added to the Gallery.",
        );
      } else if (
        result.galleryStatus ===
        "not_featured"
      ) {
        setMessage(
          "Removed from the Gallery.",
        );
      } else if (
        result.galleryStatus ===
        "declined"
      ) {
        setMessage(
          "Gallery suggestion declined.",
        );
      }
    } catch (error) {
      console.error(
        "Could not change Gallery status:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The Gallery could not be updated.",
      );
    } finally {
      setSavingId(
        null,
      );
    }
  }

  /*
   * REUSABLE ARTWORK CARD
   */

  function artworkCard(
    artwork: Artwork,
    mode:
      | "pending"
      | "discover"
      | "featured"
      | "declined",
  ) {
    const studioName =
      studioNames[
        artwork.studio_slug
      ] ??
      artwork.studio_slug;

    const busy =
      savingId ===
      artwork.id;

    return (
      <article
        key={
          artwork.id
        }
        className="overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm"
      >

        <div className="aspect-[4/3] overflow-hidden bg-nebari-paper/40">

          <img
            src={
              artwork.image_url
            }
            alt={
              artwork.title
            }
            className="h-full w-full object-cover"
          />

        </div>

        <div className="p-5">

          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nebari-green">
            {studioName}
          </p>

          <h3 className="nebari-serif mt-2 text-2xl text-nebari-ink">
            {artwork.title}
          </h3>

          {artwork.category && (
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-nebari-muted">
              {
                artwork.category
              }
            </p>
          )}

          {artwork.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-nebari-muted">
              {
                artwork.description
              }
            </p>
          )}

          <div className="mt-5 border-t border-nebari-border pt-5">

            <Link
              href={`/studios/${artwork.studio_slug}/artwork/${artwork.id}`}
              target="_blank"
              className="text-sm text-nebari-muted transition-colors hover:text-nebari-green"
            >
              View artwork →
            </Link>

            {mode ===
              "pending" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={() =>
                    changeStatus(
                      artwork.id,
                      "approve",
                    )
                  }
                  className="rounded-full bg-nebari-green px-5 py-3 text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {busy
                    ? "Updating..."
                    : "Add to Gallery"}
                </button>

                <button
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={() =>
                    changeStatus(
                      artwork.id,
                      "decline",
                    )
                  }
                  className="rounded-full border border-nebari-border px-5 py-3 text-sm text-nebari-muted transition-colors hover:border-nebari-maple hover:text-nebari-maple disabled:opacity-50"
                >
                  Decline
                </button>

              </div>
            )}

            {mode ===
              "discover" && (
              <button
                type="button"
                disabled={
                  busy
                }
                onClick={() =>
                  changeStatus(
                    artwork.id,
                    "feature",
                  )
                }
                className="mt-4 w-full rounded-full bg-nebari-green px-5 py-3 text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {busy
                  ? "Adding..."
                  : "Add to Gallery"}
              </button>
            )}

            {mode ===
              "featured" && (
              <button
                type="button"
                disabled={
                  busy
                }
                onClick={() =>
                  changeStatus(
                    artwork.id,
                    "remove",
                  )
                }
                className="mt-4 w-full rounded-full border border-nebari-border px-5 py-3 text-sm text-nebari-muted transition-colors hover:border-nebari-maple hover:text-nebari-maple disabled:opacity-50"
              >
                {busy
                  ? "Removing..."
                  : "Remove from Gallery"}
              </button>
            )}

            {mode ===
              "declined" && (
              <button
                type="button"
                disabled={
                  busy
                }
                onClick={() =>
                  changeStatus(
                    artwork.id,
                    "feature",
                  )
                }
                className="mt-4 w-full rounded-full border border-nebari-green px-5 py-3 text-sm text-nebari-green transition-colors hover:bg-nebari-green hover:text-white disabled:opacity-50"
              >
                {busy
                  ? "Adding..."
                  : "Add to Gallery Anyway"}
              </button>
            )}

          </div>

        </div>

      </article>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* TOP BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/account"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <Link
            href="/account"
            className="text-xs font-medium uppercase tracking-[0.14em] text-nebari-muted transition-colors hover:text-nebari-green"
          >
            Administration
          </Link>

        </div>

      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">

        {/* HEADER */}

        <header className="mx-auto max-w-2xl text-center">

          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Behind the Gallery
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink sm:text-6xl">
            Gallery Curation
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-nebari-muted">
            Select work directly from personal Studios
            for inclusion in the shared Gallery.
          </p>

        </header>

        {/* STATUS MESSAGE */}

        {message && (
          <p className="mx-auto mt-8 max-w-xl rounded-xl bg-nebari-paper/50 p-4 text-center text-sm text-nebari-green">
            {message}
          </p>
        )}

        {errorMessage && (
          <p className="mx-auto mt-8 max-w-xl rounded-xl border border-nebari-maple/30 bg-nebari-surface p-4 text-center text-sm text-nebari-maple">
            {errorMessage}
          </p>
        )}

        {loading ? (
          <p className="mt-12 text-center italic text-nebari-muted">
            Walking through the Studios...
          </p>
        ) : (
          <>

            {/* AWAITING REVIEW */}

            <section className="mt-14">

              <div className="border-b border-nebari-border pb-5">

                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-nebari-maple">
                  Artist Suggestions
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">

                  <h2 className="nebari-serif text-3xl text-nebari-ink">
                    Awaiting Review
                  </h2>

                  <p className="text-sm text-nebari-muted">
                    {
                      awaitingReview.length
                    }
                  </p>

                </div>

              </div>

              {awaitingReview.length ===
              0 ? (
                <p className="py-8 text-sm italic text-nebari-muted">
                  Nothing is waiting for review.
                </p>
              ) : (
                <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                  {awaitingReview.map(
                    (artwork) =>
                      artworkCard(
                        artwork,
                        "pending",
                      ),
                  )}

                </div>
              )}

            </section>

            {/* DISCOVER IN STUDIOS */}

            <section className="mt-16">

              <div className="border-b border-nebari-border pb-5">

                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-nebari-green">
                  Curator&apos;s View
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">

                  <div>

                    <h2 className="nebari-serif text-3xl text-nebari-ink">
                      Discover in Studios
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-nebari-muted">
                      Work available for selection,
                      whether or not the artist suggested it.
                    </p>

                  </div>

                  <p className="text-sm text-nebari-muted">
                    {
                      studioWork.length
                    }
                  </p>

                </div>

              </div>

              {studioWork.length ===
              0 ? (
                <p className="py-8 text-sm italic text-nebari-muted">
                  No unselected Studio work at the moment.
                </p>
              ) : (
                <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                  {studioWork.map(
                    (artwork) =>
                      artworkCard(
                        artwork,
                        "discover",
                      ),
                  )}

                </div>
              )}

            </section>

            {/* CURRENTLY IN GALLERY */}

            <section className="mt-16">

              <div className="border-b border-nebari-border pb-5">

                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-nebari-green">
                  Shared Exhibition
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">

                  <h2 className="nebari-serif text-3xl text-nebari-ink">
                    Currently in Gallery
                  </h2>

                  <p className="text-sm text-nebari-muted">
                    {
                      featuredWork.length
                    }
                  </p>

                </div>

              </div>

              {featuredWork.length ===
              0 ? (
                <p className="py-8 text-sm italic text-nebari-muted">
                  The Gallery is waiting for its first selection.
                </p>
              ) : (
                <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                  {featuredWork.map(
                    (artwork) =>
                      artworkCard(
                        artwork,
                        "featured",
                      ),
                  )}

                </div>
              )}

            </section>

            {/* DECLINED SUGGESTIONS */}

            {declinedWork.length >
              0 && (
              <section className="mt-16">

                <div className="border-b border-nebari-border pb-5">

                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-nebari-muted">
                    Archive
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-4">

                    <h2 className="nebari-serif text-3xl text-nebari-ink">
                      Declined Suggestions
                    </h2>

                    <p className="text-sm text-nebari-muted">
                      {
                        declinedWork.length
                      }
                    </p>

                  </div>

                </div>

                <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                  {declinedWork.map(
                    (artwork) =>
                      artworkCard(
                        artwork,
                        "declined",
                      ),
                  )}

                </div>

              </section>
            )}

          </>
        )}

        <div className="mt-16 border-t border-nebari-border pt-8 text-center">

          <Link
            href="/account"
            className="text-sm text-nebari-muted transition-colors hover:text-nebari-green"
          >
            ← Return to Administration
          </Link>

        </div>

      </div>

    </main>
  );
}