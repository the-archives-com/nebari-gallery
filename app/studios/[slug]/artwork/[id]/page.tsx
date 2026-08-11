"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../../../lib/supabase";

type Studio = {
  slug: string;
  name: string;
  owner: string | null;
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
  storage_path: string | null;
  category: string | null;
  gallery_status: string | null;
};

const collections = [
  "Photography",
  "Artwork",
  "Works in Progress",
];

export default function ArtworkPage() {
  const params = useParams<{
    slug: string;
    id: string;
  }>();

  const router = useRouter();

  const [studio, setStudio] =
    useState<Studio | null>(null);

  const [artwork, setArtwork] =
    useState<Artwork | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [isOwner, setIsOwner] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    editTitle,
    setEditTitle,
  ] = useState("");

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [
    editCategory,
    setEditCategory,
  ] = useState("");

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setIsOwner(false);
      setEditing(false);

      const [
        studioResult,
        artworkResult,
        userResult,
      ] = await Promise.all([
        supabase
          .from("studios")
          .select(
            "slug, name, owner, description, icon, colour",
          )
          .eq(
            "slug",
            params.slug,
          )
          .maybeSingle(),

        supabase
          .from("studio_artworks")
          .select("*")
          .eq("id", params.id)
          .eq(
            "studio_slug",
            params.slug,
          )
          .maybeSingle(),

        supabase.auth.getUser(),
      ]);

      if (studioResult.error) {
        console.error(
          "Could not load Studio:",
          studioResult.error,
        );
      }

      if (artworkResult.error) {
        console.error(
          "Could not load artwork:",
          artworkResult.error,
        );
      }

      setStudio(
        studioResult.data ?? null,
      );

      const loadedArtwork =
        artworkResult.data ?? null;

      setArtwork(loadedArtwork);

      if (loadedArtwork) {
        setEditTitle(
          loadedArtwork.title,
        );

        setEditDescription(
          loadedArtwork.description ??
            "",
        );

        setEditCategory(
          loadedArtwork.category ??
            "",
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

    loadPage();
  }, [params.id, params.slug]);

  async function handleUpdateDetails() {
    if (!artwork || !isOwner) {
      return;
    }

    if (!editTitle.trim()) {
      alert(
        "The artwork needs a title.",
      );
      return;
    }

    setSaving(true);

    const { error } =
      await supabase
        .from("studio_artworks")
        .update({
          title:
            editTitle.trim(),

          description:
            editDescription.trim() ||
            null,

          category:
            editCategory || null,
        })
        .eq("id", artwork.id)
        .eq(
          "studio_slug",
          params.slug,
        );

    if (error) {
      console.error(
        "Could not update artwork:",
        error,
      );

      alert(
        `Could not update details: ${error.message}`,
      );

      setSaving(false);
      return;
    }

    setArtwork({
      ...artwork,

      title:
        editTitle.trim(),

      description:
        editDescription.trim() ||
        null,

      category:
        editCategory || null,
    });

    setEditing(false);
    setSaving(false);
  }

  async function handleTakeDown() {
    if (
      !artwork ||
      !studio ||
      !isOwner
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Take down "${artwork.title}" from ${studio.name}?`,
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    if (artwork.storage_path) {
      const {
        error: storageError,
      } =
        await supabase.storage
          .from("studio-art")
          .remove([
            artwork.storage_path,
          ]);

      if (storageError) {
        console.error(
          "Could not remove stored image:",
          storageError,
        );

        alert(
          `Could not remove image: ${storageError.message}`,
        );

        setSaving(false);
        return;
      }
    }

    const {
      error: databaseError,
    } = await supabase
      .from("studio_artworks")
      .delete()
      .eq("id", artwork.id)
      .eq(
        "studio_slug",
        params.slug,
      );

    if (databaseError) {
      console.error(
        "Could not take down artwork:",
        databaseError,
      );

      alert(
        `Could not take down artwork: ${databaseError.message}`,
      );

      setSaving(false);
      return;
    }

    router.replace(
      `/studios/${studio.slug}`,
    );

    router.refresh();
  }

  /*
   * Submit this piece for consideration
   * in the shared Nebari Gallery.
   *
   * This does NOT publish it.
   */
  async function handleGallerySubmission() {
    if (!artwork || !isOwner) {
      return;
    }

    if (
      artwork.gallery_status ===
      "pending"
    ) {
      return;
    }

    if (
      artwork.gallery_status ===
      "featured"
    ) {
      return;
    }

    setSaving(true);

    const result =
      await supabase
        .from("studio_artworks")
        .update({
          gallery_status:
            "pending",
        })
        .eq("id", artwork.id)
        .eq(
          "studio_slug",
          params.slug,
        )
        .select(
          "id, gallery_status",
        );

    if (result.error) {
      console.error(
        "Could not submit artwork to Gallery:",
        result.error,
      );

      alert(
        `Could not submit to the Gallery: ${result.error.message}`,
      );

      setSaving(false);
      return;
    }

    if (
      !result.data ||
      result.data.length === 0
    ) {
      alert(
        "The Gallery submission was not saved. Your account may not have permission to update this artwork.",
      );

      setSaving(false);
      return;
    }

    setArtwork({
      ...artwork,
      gallery_status:
        result.data[0]
          .gallery_status,
    });

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">

        <p className="text-center italic text-nebari-muted">
          Preparing the artwork...
        </p>

      </main>
    );
  }

  if (!studio) {
    return (
      <main className="min-h-screen bg-background px-6 py-20 text-foreground">

        <div className="mx-auto max-w-xl text-center">

          <h1 className="nebari-serif text-4xl font-medium text-nebari-ink">
            Studio not found.
          </h1>

          <Link
            href="/studios"
            className="mt-7 inline-block text-sm text-nebari-green transition-colors hover:text-nebari-maple"
          >
            ← Return to Studios
          </Link>

        </div>

      </main>
    );
  }

  if (!artwork) {
    return (
      <main className="min-h-screen bg-background px-6 py-20 text-foreground">

        <div className="mx-auto max-w-xl text-center">

          <h1 className="nebari-serif text-4xl font-medium text-nebari-ink">
            This piece isn&apos;t on the wall.
          </h1>

          <Link
            href={`/studios/${studio.slug}`}
            className="mt-7 inline-block text-sm text-nebari-green transition-colors hover:text-nebari-maple"
          >
            ← Return to {studio.name}
          </Link>

        </div>

      </main>
    );
  }

  const galleryStatus =
    artwork.gallery_status ??
    "not_featured";

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
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Studios
            </Link>

          </nav>

        </div>

      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">

        {/* RETURN TO STUDIO */}

        <nav>
          <Link
            href={`/studios/${studio.slug}`}
            className="text-sm text-nebari-muted transition-colors hover:text-nebari-green"
          >
            ← {studio.name}
          </Link>
        </nav>

        {/* ARTWORK */}

        <article className="mt-8 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-xl">

          <div className="bg-nebari-paper/40 p-3 sm:p-5">

            <img
              src={
                artwork.image_url
              }
              alt={
                artwork.title
              }
              className="mx-auto max-h-[75vh] w-full rounded-xl object-contain"
            />

          </div>

          <div className="space-y-5 p-6 sm:p-10">

            {!editing ? (
              <>

                <header>

                  <h1 className="nebari-serif text-4xl font-medium tracking-tight text-nebari-ink sm:text-5xl">
                    {artwork.title}
                  </h1>

                  {artwork.category && (
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-nebari-green">
                      {artwork.category}
                    </p>
                  )}

                </header>

                {artwork.description && (
                  <p className="max-w-2xl whitespace-pre-wrap text-base leading-8 text-nebari-muted">
                    {
                      artwork.description
                    }
                  </p>
                )}

              </>
            ) : isOwner ? (
              <div className="space-y-5">

                <div>

                  <label
                    htmlFor="edit-title"
                    className="block text-sm font-medium text-nebari-ink"
                  >
                    Title
                  </label>

                  <input
                    id="edit-title"
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(
                        event.target
                          .value,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-nebari-border bg-background px-4 py-3 text-nebari-ink focus:outline-none focus:ring-2 focus:ring-nebari-sage"
                  />

                </div>

                <div>

                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-medium text-nebari-ink"
                  >
                    Reflection / About this piece
                  </label>

                  <textarea
                    id="edit-description"
                    rows={6}
                    value={
                      editDescription
                    }
                    onChange={(event) =>
                      setEditDescription(
                        event.target
                          .value,
                      )
                    }
                    className="mt-2 w-full resize-y rounded-xl border border-nebari-border bg-background px-4 py-3 text-nebari-ink focus:outline-none focus:ring-2 focus:ring-nebari-sage"
                  />

                </div>

                <div>

                  <label
                    htmlFor="edit-category"
                    className="block text-sm font-medium text-nebari-ink"
                  >
                    Collection
                  </label>

                  <select
                    id="edit-category"
                    value={
                      editCategory
                    }
                    onChange={(event) =>
                      setEditCategory(
                        event.target
                          .value,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-nebari-border bg-background px-4 py-3 text-nebari-ink"
                  >

                    <option value="">
                      Choose a collection...
                    </option>

                    {collections.map(
                      (collection) => (
                        <option
                          key={
                            collection
                          }
                          value={
                            collection
                          }
                        >
                          {
                            collection
                          }
                        </option>
                      ),
                    )}

                  </select>

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={
                      handleUpdateDetails
                    }
                    disabled={
                      saving
                    }
                    className="rounded-full bg-nebari-green px-6 py-3 text-sm text-white transition-colors hover:opacity-90 disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditing(false)
                    }
                    disabled={
                      saving
                    }
                    className="rounded-full border border-nebari-border px-6 py-3 text-sm text-nebari-muted transition-colors hover:bg-nebari-paper/40"
                  >
                    Cancel
                  </button>

                </div>

              </div>
            ) : null}

            <p className="text-sm text-nebari-muted">
              {new Date(
                artwork.created_at,
              ).toLocaleDateString(
                "en-AU",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
            </p>

          </div>

        </article>

        {/* OWNER TOOLS */}

        {isOwner && (
          <section className="mt-8 rounded-2xl border border-nebari-border bg-nebari-surface p-6 shadow-sm">

            <p className="mb-5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
              Studio Tools
            </p>

            <div className="grid gap-3 sm:grid-cols-3">

              <button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
                disabled={saving}
                className="rounded-full border border-nebari-border px-5 py-3 text-sm text-nebari-ink transition-all hover:border-nebari-sage hover:bg-nebari-paper/40 disabled:opacity-50"
              >
                Update Details
              </button>

              <button
                type="button"
                onClick={
                  handleTakeDown
                }
                disabled={saving}
                className="rounded-full border border-nebari-border px-5 py-3 text-sm text-nebari-ink transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                Take Down
              </button>

              <button
                type="button"
                onClick={
                  handleGallerySubmission
                }
                disabled={
                  saving ||
                  galleryStatus ===
                    "pending" ||
                  galleryStatus ===
                    "featured"
                }
                className={`rounded-full px-5 py-3 text-sm transition-all disabled:cursor-default ${
                  galleryStatus ===
                  "pending"
                    ? "border border-nebari-sage bg-nebari-paper/50 text-nebari-green"
                    : galleryStatus ===
                        "featured"
                      ? "border border-nebari-sage bg-nebari-paper/50 text-nebari-green"
                      : "bg-nebari-green text-white hover:opacity-90"
                }`}
              >

                {saving
                  ? "Submitting..."
                  : galleryStatus ===
                      "pending"
                    ? "Awaiting Gallery Review"
                    : galleryStatus ===
                        "featured"
                      ? "Selected for Gallery"
                      : galleryStatus ===
                          "declined"
                        ? "Submit Again"
                        : "Submit to Gallery"}

              </button>

            </div>

            {/* GALLERY STATUS */}

            {galleryStatus ===
              "pending" && (
              <p className="mt-5 text-center text-sm leading-6 text-nebari-muted">
                This piece has been submitted
                for Gallery consideration.
              </p>
            )}

            {galleryStatus ===
              "featured" && (
              <p className="mt-5 text-center text-sm leading-6 text-nebari-muted">
                This piece is currently part
                of the Nebari Gallery.
              </p>
            )}

            {galleryStatus ===
              "declined" && (
              <p className="mt-5 text-center text-sm leading-6 text-nebari-muted">
                This piece isn&apos;t currently
                selected for the shared Gallery.
                You&apos;re welcome to submit it
                again.
              </p>
            )}

          </section>
        )}

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