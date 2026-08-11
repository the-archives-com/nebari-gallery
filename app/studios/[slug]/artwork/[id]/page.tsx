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
  gallery_status: string;
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

      const [
        studioResult,
        artworkResult,
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

      setLoading(false);
    }

    loadPage();
  }, [params.id, params.slug]);

  async function handleUpdateDetails() {
    if (!artwork) {
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
        .eq("id", artwork.id);

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
      !studio
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
      .eq("id", artwork.id);

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

  async function handleGalleryFeature() {
    if (!artwork) {
      return;
    }

    const wasFeatured =
      artwork.gallery_status ===
      "featured";

    const newStatus =
      wasFeatured
        ? "not_featured"
        : "featured";

    setSaving(true);

    const result =
      await supabase
        .from("studio_artworks")
        .update({
          gallery_status:
            newStatus,
        })
        .eq("id", artwork.id)
        .select(
          "id, gallery_status",
        );

    if (result.error) {
      console.error(
        "Could not change Gallery status:",
        result.error,
      );

      alert(
        `Could not change Gallery status: ${result.error.message}`,
      );

      setSaving(false);
      return;
    }

    if (
      !result.data ||
      result.data.length === 0
    ) {
      alert(
        "The Gallery status was not changed. Your account may not have permission to update this artwork.",
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

    if (wasFeatured) {
      router.replace(
        "/gallery",
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <p className="text-center italic text-stone-500">
          🌿 Preparing the artwork...
        </p>
      </main>
    );
  }

  if (!studio) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-3xl">
            🌱
          </p>

          <h1 className="mt-4 text-3xl font-light">
            Studio not found.
          </h1>

          <Link
            href="/studios"
            className="mt-6 inline-block text-stone-600 hover:text-stone-900"
          >
            ← Return to Studios
          </Link>
        </div>
      </main>
    );
  }

  if (!artwork) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-3xl">
            🖼️
          </p>

          <h1 className="mt-4 text-3xl font-light">
            This piece isn&apos;t on
            the wall.
          </h1>

          <Link
            href={`/studios/${studio.slug}`}
            className="mt-6 inline-block text-stone-600 hover:text-stone-900"
          >
            ← Return to {studio.name}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl space-y-10">

        <nav>
          <Link
            href={`/studios/${studio.slug}`}
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            ← {studio.name}
          </Link>
        </nav>

        <article className="overflow-hidden rounded-2xl bg-white shadow-xl">

          <div className="bg-stone-100 p-3 sm:p-5">
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
                  <h1 className="text-3xl font-light tracking-wide text-stone-900 sm:text-4xl">
                    {artwork.title}
                  </h1>

                  {artwork.category && (
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-400">
                      {
                        artwork.category
                      }
                    </p>
                  )}
                </header>

                {artwork.description && (
                  <p className="max-w-2xl whitespace-pre-wrap text-base leading-8 text-stone-600">
                    {
                      artwork.description
                    }
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-5">

                <div>
                  <label
                    htmlFor="edit-title"
                    className="block text-sm font-medium text-stone-700"
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
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-medium text-stone-700"
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
                    className="mt-2 w-full resize-y rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-category"
                    className="block text-sm font-medium text-stone-700"
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
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3"
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
                    className="rounded-full bg-stone-800 px-6 py-3 text-sm text-white hover:bg-stone-700 disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditing(
                        false,
                      )
                    }
                    disabled={
                      saving
                    }
                    className="rounded-full border border-stone-300 px-6 py-3 text-sm text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            )}

            <p className="text-sm text-stone-400">
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

        <section className="rounded-2xl border border-stone-200 bg-white p-6">

          <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
            Studio Tools
          </p>

          <div className="grid gap-3 sm:grid-cols-3">

            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              disabled={saving}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700 transition-all hover:bg-stone-100 disabled:opacity-50"
            >
              ✏ Update Details
            </button>

            <button
              type="button"
              onClick={
                handleTakeDown
              }
              disabled={saving}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              🪝 Take Down
            </button>

            <button
              type="button"
              onClick={
                handleGalleryFeature
              }
              disabled={saving}
              className={`rounded-full px-5 py-3 text-sm transition-all disabled:opacity-50 ${
                artwork.gallery_status ===
                "featured"
                  ? "border border-amber-300 bg-amber-50 text-amber-800"
                  : "bg-stone-800 text-white hover:bg-stone-700"
              }`}
            >
              {artwork.gallery_status ===
              "featured"
                ? "✓ Remove from Gallery"
                : "⭐ Add to Gallery"}
            </button>

          </div>

          {artwork.gallery_status ===
            "featured" && (
            <p className="mt-4 text-center text-sm text-stone-500">
              This piece is currently part
              of the Nebari Gallery.
            </p>
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