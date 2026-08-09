"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { getStudio } from "../../../../lib/studios";
import { supabase } from "../../../../lib/supabase";

export default function UploadArtworkPage() {
  const params = useParams<{ slug: string }>();
  const studio = getStudio(params.slug);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!studio) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <p className="text-3xl">🌱</p>

          <h1 className="text-3xl font-light">
            Studio not found.
          </h1>

          <Link
            href="/studios"
            className="text-stone-600 hover:text-stone-900"
          >
            ← Return to Studios
          </Link>
        </div>
      </main>
    );
  }

    async function handleSubmit() {
      if (!studio) {
        alert("Studio not found.");
        return;
      }

      if (!selectedFile) {
        alert("Choose an artwork first.");
        return;
      }

      if (!title.trim()) {
        alert("Give the artwork a title.");
        return;
      }

      setSaving(true);

    try {
      const safeFileName = selectedFile.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-");

      const filePath =
        `${studio.slug}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("studio-art")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("studio-art")
          .getPublicUrl(filePath);

    const { data: newArtwork, error: databaseError } =
      await supabase
        .from("studio_artworks")
      .insert({
        studio_slug: studio.slug,
        title: title.trim(),
        description: description.trim() || null,
        image_url: publicUrlData.publicUrl,
        storage_path: filePath,
        category: category || null,
        gallery_status: "not_featured",
      }) 
        .select("id")
        .single();

    if (databaseError) {
      throw databaseError;
    }

      alert("Artwork hung successfully. 🌿");

      setTitle("");
setDescription("");
setCategory("");
setSelectedFile(null);

if (previewUrl) {
  URL.revokeObjectURL(previewUrl);
}

setPreviewUrl(null);

router.replace(
  `/studios/${studio.slug}?justHung=${newArtwork.id}`,
);


      setPreviewUrl(null);
    } catch (error) {
      console.error("Could not hang artwork:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something unexpected happened.";

      alert(`Could not hang artwork: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-xl space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-3xl">{studio.symbol}</p>

          <h1 className="text-4xl font-light tracking-wide">
            Hang Artwork
          </h1>

          <p className="text-stone-600">
            Adding something to {studio.name}
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-medium text-stone-700">
              Artwork
            </p>

            <input
              id="artwork"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file =
                  event.target.files?.[0] ?? null;

                setSelectedFile(file);

                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                }

                if (file) {
                  setPreviewUrl(
                    URL.createObjectURL(file),
                  );
                } else {
                  setPreviewUrl(null);
                }
              }}
              className="hidden"
            />

            <label
              htmlFor="artwork"
              className="
                mt-3
                flex
                cursor-pointer
                items-center
                justify-center
                rounded-2xl
                border-2
                border-dashed
                border-stone-300
                bg-stone-50
                px-6
                py-8
                text-center
                transition-all
                duration-300
                hover:border-stone-500
                hover:bg-stone-100
              "
            >
              {previewUrl ? (
                <div className="w-full">
                  <div className="overflow-hidden rounded-xl bg-stone-100">
                    <img
                      src={previewUrl}
                      alt="Artwork preview"
                      className="max-h-96 w-full object-contain"
                    />
                  </div>

                  <p className="mt-4 font-medium text-stone-700">
                    ✓ Ready to hang
                  </p>

                  <p className="mt-1 text-sm text-stone-500">
                    Tap the image to choose another piece.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl">🖼️</p>

                  <p className="mt-3 font-medium text-stone-700">
                    Choose Artwork
                  </p>

                  <p className="mt-1 text-sm text-stone-500">
                    Tap here to select an image
                  </p>
                </div>
              )}
            </label>

            {selectedFile && (
              <div className="mt-4 rounded-xl bg-stone-100 p-4 text-center">
                <p className="font-medium text-stone-700">
                  ✓ {selectedFile.name}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  Ready to hang in the Studio.
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-stone-700"
            >
              Title
            </label>

            <input
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Give this piece a name..."
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-stone-300
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-stone-300
              "
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-stone-700"
            >
              About this piece
            </label>

            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="A few words about the work..."
              className="
                mt-2
                w-full
                resize-y
                rounded-xl
                border
                border-stone-300
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-stone-300
              "
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-stone-700"
            >
              Collection
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-stone-300
                bg-white
                px-4
                py-3
              "
            >
              <option value="">
                Choose a collection...
              </option>

              {studio.sections.map((section) => (
                <option
                  key={section}
                  value={section}
                >
                  {section}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="
              w-full
              rounded-full
              bg-stone-800
              px-8
              py-3
              text-stone-50
              transition-all
              duration-300
              hover:bg-stone-700
              active:scale-[0.98]
              disabled:cursor-wait
              disabled:opacity-60
            "
          >
            {saving
              ? "🌿 Hanging Artwork..."
              : "🖼️ Hang in Studio"}
          </button>
        </section>

        <div className="text-center">
          <Link
            href={`/studios/${studio.slug}`}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            ← Return to {studio.name}
          </Link>
        </div>
      </div>
    </main>
  );
}