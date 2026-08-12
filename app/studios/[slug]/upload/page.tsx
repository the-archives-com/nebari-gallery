"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "../../../../lib/supabase";

type Studio = {
  slug: string;
  name: string;
  owner: string | null;
  description: string | null;
  icon: string | null;
  colour: string | null;
};

const collections = [
  "Photography",
  "Artwork",
  "Works in Progress",
];

export default function UploadArtworkPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [studio, setStudio] =
    useState<Studio | null>(null);

  const [loadingStudio, setLoadingStudio] =
    useState(true);

  const [authorised, setAuthorised] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadStudio() {
      setLoadingStudio(true);

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
        .select("role")
        .eq("user_id", user.id)
        .eq("studio_slug", params.slug)
        .eq("role", "owner")
        .maybeSingle();

      if (
        membershipError ||
        !membership
      ) {
        console.error(
          "Could not verify Studio ownership:",
          membershipError,
        );

        router.replace(
          `/studios/${params.slug}`,
        );

        return;
      }

      setAuthorised(true);

      const { data, error } = await supabase
        .from("studios")
        .select(
          "slug, name, owner, description, icon, colour",
        )
        .eq("slug", params.slug)
        .maybeSingle();

      if (error) {
        console.error(
          "Could not load Studio:",
          error,
        );
      }

      setStudio(data ?? null);
      setLoadingStudio(false);
    }

    loadStudio();
  }, [params.slug, router]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit() {
    if (!studio || !authorised) {
      setMessage(
        "You do not have permission to add work to this Studio.",
      );
      return;
    }

    if (!selectedFile) {
      setMessage(
        "Choose an image to hang first.",
      );
      return;
    }

    if (!title.trim()) {
      setMessage(
        "Give this piece a title.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const safeFileName =
        selectedFile.name
          .toLowerCase()
          .replace(
            /[^a-z0-9._-]+/g,
            "-",
          );

      const filePath =
        `${studio.slug}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("studio-art")
          .upload(
            filePath,
            selectedFile,
            {
              cacheControl: "3600",
              upsert: false,
            },
          );

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("studio-art")
          .getPublicUrl(filePath);

      const {
        data: newArtwork,
        error: databaseError,
      } = await supabase
        .from("studio_artworks")
        .insert({
          studio_slug:
            studio.slug,

          title:
            title.trim(),

          description:
            description.trim() || null,

          image_url:
            publicUrlData.publicUrl,

          storage_path:
            filePath,

          category:
            category || null,

          gallery_status:
            "not_featured",
        })
        .select("id")
        .single();

      if (databaseError) {
        throw databaseError;
      }

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }

      router.replace(
        `/studios/${studio.slug}?justHung=${newArtwork.id}`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Could not hang artwork:",
        error,
      );

      const errorText =
        error instanceof Error
          ? error.message
          : "Something unexpected happened.";

      setMessage(
        `Could not hang artwork: ${errorText}`,
      );

      setSaving(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setSelectedFile(file);
    setMessage("");

    if (file) {
      setPreviewUrl(
        URL.createObjectURL(file),
      );
    } else {
      setPreviewUrl(null);
    }
  }

  if (loadingStudio) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">

        <p className="text-center italic text-nebari-muted">
          Opening your Studio...
        </p>

      </main>
    );
  }

  if (!studio) {
    return (
      <main className="min-h-screen bg-background px-6 py-20 text-foreground">

        <div className="mx-auto max-w-xl text-center">

          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Nebari
          </p>

          <h1 className="nebari-serif mt-4 text-4xl text-nebari-ink">
            Studio not found.
          </h1>

          <Link
            href="/studios"
            className="mt-6 inline-block text-sm text-nebari-muted transition-colors hover:text-nebari-green"
          >
            ← Return to Studios
          </Link>

        </div>

      </main>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-nebari-border bg-background px-4 py-3 text-nebari-ink outline-none transition-all placeholder:text-nebari-muted/60 focus:border-nebari-sage focus:ring-2 focus:ring-nebari-sage/20";

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <Link
            href={`/studios/${studio.slug}`}
            className="text-xs font-medium uppercase tracking-[0.14em] text-nebari-muted transition-colors hover:text-nebari-green"
          >
            My Studio
          </Link>

        </div>

      </div>

      <div className="mx-auto max-w-2xl px-6 py-16">

        {/* HEADER */}

        <header className="text-center">

          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            {studio.name}
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink sm:text-6xl">
            Hang something new.
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-nebari-muted">
            Add a finished piece, a photograph,
            or something still finding its way.
          </p>

        </header>

        {/* FORM */}

        <section className="mt-10 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">

          {/* THE WORK */}

          <div className="border-b border-nebari-border p-8">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
              The Work
            </p>

            <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
              What are you hanging?
            </h2>

            <input
              id="artwork"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor="artwork"
              className="mt-6 flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-nebari-border bg-nebari-paper/30 p-4 text-center transition-all duration-300 hover:border-nebari-sage hover:bg-nebari-paper/50"
            >
              {previewUrl ? (
                <div className="w-full">

                  <div className="overflow-hidden rounded-xl bg-background">
                    <img
                      src={previewUrl}
                      alt="Artwork preview"
                      className="max-h-[32rem] w-full object-contain"
                    />
                  </div>

                  <p className="mt-4 text-sm font-medium text-nebari-ink">
                    Ready to hang
                  </p>

                  <p className="mt-1 text-xs text-nebari-muted">
                    Select the image to choose another.
                  </p>

                </div>
              ) : (
                <div className="px-6 py-10">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-nebari-border">
                    <span className="nebari-serif text-xl text-nebari-maple">
                      +
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-medium text-nebari-ink">
                    Choose an image
                  </p>

                  <p className="mt-2 text-xs leading-5 text-nebari-muted">
                    Select a photograph or image from your device.
                  </p>

                </div>
              )}
            </label>

            <div className="mt-6">

              <label
                htmlFor="title"
                className="block text-sm font-medium text-nebari-ink"
              >
                Title
              </label>

              <input
                id="title"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder="Give this piece a name..."
                className={inputClass}
              />

            </div>

          </div>

          {/* THE STORY */}

          <div className="border-b border-nebari-border p-8">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
              The Story
            </p>

            <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
              A few words, if you like.
            </h2>

            <p className="mt-3 text-sm leading-6 text-nebari-muted">
              What were you making, noticing or
              thinking about? This part is optional.
            </p>

            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Tell us something about the work..."
              className={`${inputClass} resize-y leading-7`}
            />

          </div>

          {/* THE COLLECTION */}

          <div className="p-8">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
              The Collection
            </p>

            <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
              Where does it belong?
            </h2>

            <p className="mt-3 text-sm leading-6 text-nebari-muted">
              Collections help visitors browse your
              Studio without changing how you work.
            </p>

            <label
              htmlFor="category"
              className="mt-6 block text-sm font-medium text-nebari-ink"
            >
              Collection
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="">
                Choose a collection...
              </option>

              {collections.map(
                (collection) => (
                  <option
                    key={collection}
                    value={collection}
                  >
                    {collection}
                  </option>
                ),
              )}

            </select>

          </div>

          {/* HANG */}

          <div className="border-t border-nebari-border bg-nebari-paper/30 px-8 py-7">

            {message && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-nebari-border bg-nebari-surface p-4 text-center text-sm leading-6 text-nebari-maple"
              >
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full rounded-full bg-nebari-green px-8 py-3.5 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {saving
                ? "Hanging your work..."
                : "Hang in Studio"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-nebari-muted">
              This adds the piece to your Studio.
              Gallery submission remains your choice.
            </p>

          </div>

        </section>

        <div className="mt-8 text-center">

          <Link
            href={`/studios/${studio.slug}`}
            className="text-sm text-nebari-muted transition-colors hover:text-nebari-green"
          >
            ← Return to {studio.name}
          </Link>

        </div>

      </div>

      {/* TIMBER FOOTER */}

      <footer className="mt-12 border-t border-[#2b211c] bg-[#3b2f2a]">

        <div className="mx-auto max-w-6xl px-6 py-8 text-center">

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