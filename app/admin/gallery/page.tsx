"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

type PendingArtwork = {
  id: number;
  created_at: string;
  studio_slug: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  gallery_status: string | null;
};

type Studio = {
  slug: string;
  name: string;
  owner: string;
};

type StudioMap = {
  [slug: string]: Studio;
};

export default function GallerySubmissionsPage() {
  const router = useRouter();

  const [submissions, setSubmissions] =
    useState<PendingArtwork[]>([]);

  const [studios, setStudios] =
    useState<StudioMap>({});

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("studio_members")
        .select("studio_slug, role")
        .eq("user_id", user.id)
        .eq("studio_slug", "nebari")
        .eq("role", "owner")
        .maybeSingle();

      if (
        membershipError ||
        !membership
      ) {
        router.replace("/account");
        return;
      }

      const [
        artworkResult,
        studioResult,
      ] = await Promise.all([
        supabase
          .from("studio_artworks")
          .select(
            "id, created_at, studio_slug, title, description, image_url, category, gallery_status",
          )
          .eq(
            "gallery_status",
            "pending",
          )
          .order("created_at", {
            ascending: true,
          }),

        supabase
          .from("studios")
          .select(
            "slug, name, owner",
          ),
      ]);

      if (artworkResult.error) {
        console.error(
          "Could not load Gallery submissions:",
          artworkResult.error,
        );

        setErrorMessage(
          "Gallery submissions could not be loaded.",
        );

        setLoading(false);
        return;
      }

      if (studioResult.error) {
        console.error(
          "Could not load Studios:",
          studioResult.error,
        );
      }

      const studioMap: StudioMap = {};

      for (
        const studio of
          studioResult.data ?? []
      ) {
        studioMap[studio.slug] =
          studio;
      }

      setStudios(studioMap);

      setSubmissions(
        artworkResult.data ?? [],
      );

      setLoading(false);
    }

    loadSubmissions();
  }, [router]);

  async function handleDecision(
    artworkId: number,
    action:
      | "approve"
      | "decline",
  ) {
    setProcessingId(artworkId);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setErrorMessage(
        "Your administrator session could not be verified.",
      );

      setProcessingId(null);
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/gallery-submission",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            artworkId,
            action,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "The Gallery submission could not be updated.",
        );

        setProcessingId(null);
        return;
      }

      setSubmissions(
        (current) =>
          current.filter(
            (submission) =>
              submission.id !==
              artworkId,
          ),
      );

      setProcessingId(null);
    } catch (error) {
      console.error(
        "Could not review Gallery submission:",
        error,
      );

      setErrorMessage(
        "Something went wrong while reviewing this submission.",
      );

      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ADMIN BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/account"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.14em]">

            <Link
              href="/admin/studios"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Manage Studios
            </Link>

            <Link
              href="/account"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              My Account
            </Link>

          </nav>

        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">

        {/* HEADER */}

        <header className="text-center">

          <p className="text-3xl">
            🍁
          </p>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Nebari Administration
          </p>

          <h1 className="nebari-serif mt-4 text-5xl font-medium tracking-tight text-nebari-ink">
            Gallery Submissions
          </h1>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-nebari-muted">
            Review work submitted from personal
            Studios and decide what joins the shared Gallery.
          </p>

          {!loading && (
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-nebari-green">
              {submissions.length === 1
                ? "1 piece awaiting review"
                : `${submissions.length} pieces awaiting review`}
            </p>
          )}

        </header>

        {/* LOADING */}

        {loading && (
          <p className="mt-16 text-center italic text-nebari-muted">
            Preparing the curator&apos;s desk...
          </p>
        )}

        {/* ERROR */}

        {errorMessage && (
          <p
            role="alert"
            className="mx-auto mt-10 max-w-2xl rounded-xl border border-nebari-maple/20 bg-nebari-surface p-4 text-center text-sm text-nebari-maple"
          >
            {errorMessage}
          </p>
        )}

        {/* EMPTY DESK */}

        {!loading &&
          submissions.length === 0 && (
            <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-dashed border-nebari-border bg-nebari-surface p-10 text-center shadow-sm">

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
                Gallery Review
              </p>

              <h2 className="nebari-serif mt-3 text-3xl font-medium text-nebari-ink">
                The curator&apos;s desk is clear.
              </h2>

              <p className="mt-4 text-sm leading-6 text-nebari-muted">
                New Gallery submissions will appear here
                when artists send work for consideration.
              </p>

            </div>
          )}

        {/* SUBMISSIONS */}

        {!loading &&
          submissions.length > 0 && (
            <section className="mt-14 space-y-10">

              {submissions.map(
                (submission) => {
                  const studio =
                    studios[
                      submission.studio_slug
                    ];

                  const busy =
                    processingId ===
                    submission.id;

                  return (
                    <article
                      key={submission.id}
                      className="overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm"
                    >

                      <div className="grid md:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">

                        {/* ARTWORK */}

                        <div className="bg-nebari-paper/35 p-4 sm:p-5">

                          <img
                            src={
                              submission.image_url
                            }
                            alt={
                              submission.title
                            }
                            className="h-full max-h-[560px] w-full rounded-xl object-contain"
                          />

                        </div>

                        {/* CURATOR NOTES */}

                        <div className="flex flex-col justify-between p-7 sm:p-8">

                          <div>

                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
                              Submitted Work
                            </p>

                            <h2 className="nebari-serif mt-3 text-3xl font-medium text-nebari-ink">
                              {
                                submission.title
                              }
                            </h2>

                            {submission.category && (
                              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-nebari-maple">
                                {
                                  submission.category
                                }
                              </p>
                            )}

                            <div className="mt-6 border-t border-nebari-border pt-5">

                              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nebari-muted">
                                Artist
                              </p>

                              <p className="mt-2 text-sm text-nebari-ink">
                                {studio
                                  ? studio.owner
                                  : submission.studio_slug}
                              </p>

                              <p className="mt-1 text-xs text-nebari-muted">
                                {studio
                                  ? studio.name
                                  : submission.studio_slug}
                              </p>

                            </div>

                            {submission.description && (
                              <div className="mt-6 border-t border-nebari-border pt-5">

                                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nebari-muted">
                                  About the Piece
                                </p>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-nebari-muted">
                                  {
                                    submission.description
                                  }
                                </p>

                              </div>
                            )}

                            <Link
                              href={`/studios/${submission.studio_slug}/artwork/${submission.id}`}
                              target="_blank"
                              className="mt-6 inline-block text-sm text-nebari-green transition-colors hover:text-nebari-maple"
                            >
                              View full artwork →
                            </Link>

                          </div>

                          {/* DECISION */}

                          <div className="mt-9 border-t border-nebari-border pt-6">

                            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
                              Curator&apos;s Decision
                            </p>

                            <div className="grid gap-3">

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleDecision(
                                    submission.id,
                                    "approve",
                                  )
                                }
                                className="rounded-full bg-nebari-green px-6 py-3 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                              >
                                {busy
                                  ? "Updating..."
                                  : "Add to Gallery"}
                              </button>

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleDecision(
                                    submission.id,
                                    "decline",
                                  )
                                }
                                className="rounded-full border border-nebari-border px-6 py-3 text-sm text-nebari-muted transition-all hover:border-nebari-maple/40 hover:bg-nebari-paper/35 hover:text-nebari-ink active:scale-[0.98] disabled:opacity-50"
                              >
                                Not this time
                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                },
              )}

            </section>
          )}

        {/* ADMIN SHORTCUTS */}

        <div className="mt-14 grid gap-3 sm:grid-cols-2">

          <Link
            href="/admin/studios"
            className="flex items-center justify-between rounded-xl border border-nebari-border bg-nebari-surface px-5 py-4 text-sm text-nebari-ink transition-all hover:border-nebari-sage hover:bg-nebari-paper/30"
          >
            <span>
              Manage Studios
            </span>

            <span>
              →
            </span>
          </Link>

          <Link
            href="/account"
            className="flex items-center justify-between rounded-xl border border-nebari-border bg-nebari-surface px-5 py-4 text-sm text-nebari-ink transition-all hover:border-nebari-sage hover:bg-nebari-paper/30"
          >
            <span>
              My Account
            </span>

            <span>
              →
            </span>
          </Link>

        </div>

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