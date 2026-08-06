"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

type SaveStatus = "idle" | "saving" | "success" | "error";

export default function RecordPage() {
  const router = useRouter();

  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);

  const [reflection, setReflection] = useState("");
  const [title, setTitle] = useState("");

  const [saveStatus, setSaveStatus] =
    useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (photo) {
        URL.revokeObjectURL(photo);
      }
    };
  }, [photo]);

  function handlePhotoSelect(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (photo) {
      URL.revokeObjectURL(photo);
    }

    const previewUrl = URL.createObjectURL(file);

    setLoaded(false);
    setSelectedFile(file);
    setPhoto(previewUrl);
    setSaveStatus("idle");
    setMessage("");

    window.setTimeout(() => {
      setLoaded(true);
    }, 200);
  }

  async function plantLegend() {
    if (!selectedFile) {
      alert("Choose a photograph first.");
      return;
    }

    if (!title.trim()) {
      alert("Give your Legend a title.");
      return;
    }

    setSaveStatus("saving");
    setMessage("Planting your Legend...");

    const minimumPlantingTime = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1200);
    });

    try {
      const safeFileName = selectedFile.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-");

      const filePath = `${crypto.randomUUID()}-${safeFileName}`;

      const saveLegend = async () => {
        const { error: uploadError } = await supabase.storage
          .from("legends")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("legends")
          .getPublicUrl(filePath);

        const { error: databaseError } = await supabase
          .from("legends")
          .insert({
            title: title.trim(),
            reflection: reflection.trim() || null,
            image_url: publicUrlData.publicUrl,
          });

        if (databaseError) {
          throw databaseError;
        }
      };

      await Promise.all([saveLegend(), minimumPlantingTime]);

      setSaveStatus("success");
      setMessage("Your Legend has been planted. 🌳");

      window.setTimeout(() => {
        router.push("/gallery");
      }, 700);
    } catch (error) {
      console.error("Could not plant Legend:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something unexpected happened.";

      setSaveStatus("error");
      setMessage(
        `Could not plant this Legend: ${errorMessage}`,
      );
    }
  }

  const plantButtonText = {
    idle: "🌱 Plant Legend",
    saving: "🌿 Planting...",
    success: "🌳 Legend Planted",
    error: "🌱 Try Again",
  }[saveStatus];

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 fade-in">
      {saveStatus === "saving" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50/90 px-6 backdrop-blur-sm">
          <div className="space-y-4 text-center">
            <p className="text-4xl">🌿</p>

            <p className="text-xl font-light text-stone-700">
              Planting your Legend...
            </p>

            <p className="text-sm italic text-stone-500">
              Making a place for this memory.
            </p>

            <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-stone-200">
              <div className="planting-progress h-full bg-emerald-700" />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <header className="space-y-3">
          <h1 className="text-4xl font-light tracking-wide sm:text-6xl">
            Record a Legend
          </h1>

          <p className="text-stone-600">
            Every Legend begins with noticing.
          </p>
        </header>

        <nav className="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <Link
            href="/"
            className="
              flex
              min-h-12
              w-full
              items-center
              justify-center
              rounded-full
              bg-stone-800
              px-5
              py-3
              text-sm
              text-stone-50
              transition-all
              sm:w-auto
            "
>
            Home
          </Link>

          <Link
            href="/gallery"
            className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 transition-all duration-300 hover:scale-[1.02] hover:border-stone-400 hover:bg-stone-100 active:scale-95"
          >
            Gallery
          </Link>

          <Link
            href="/record"
            aria-current="page"
            className="flex min-h-12 items-center justify-center rounded-full bg-stone-800 px-5 py-3 text-sm text-stone-50 transition-all duration-300 hover:scale-[1.02] hover:bg-stone-700 active:scale-95"
          >
            Record a Legend
          </Link>
        </nav>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-stone-300 bg-white p-8 shadow-lg">
          <p className="text-lg">🌱</p>

          <p className="mt-4 italic text-stone-500">
            Mostly it&apos;s a stick in a pot.
          </p>

          <p className="mt-6 text-sm leading-6 text-stone-500">
            Walk first.
            <br />
            The world is quieter than you remember.
          </p>
        </section>

        <section
          className={`
            mx-auto
            w-full
            max-w-md
            transition-all
            duration-700
            ${
              saveStatus === "saving"
                ? "-translate-y-2 scale-[0.98] opacity-70"
                : "translate-y-0 scale-100 opacity-100"
            }
          `}
        >
          <div className="rounded-lg bg-white p-3 pb-16 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
            <div className="relative flex h-72 items-center justify-center overflow-hidden rounded border-2 border-dashed border-stone-300 bg-stone-100 text-stone-400">
              {photo ? (
                <>
                  <Image
                    src={photo}
                    alt="Selected photograph"
                    fill
                    sizes="(max-width: 768px) 100vw, 448px"
                    unoptimized
                    className={`
                      object-contain
                      transition-all
                      duration-1000
                      ease-out
                      ${
                        loaded
                          ? "scale-100 opacity-100 blur-0"
                          : "scale-[1.02] opacity-0 blur-[2px]"
                      }
                    `}
                  />

                  {!loaded && (
                    <p className="absolute inset-x-0 bottom-4 z-10 text-sm italic text-stone-500">
                      🌿 Developing...
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center px-4">
                  <span aria-hidden="true">📷</span>
                  <span className="ml-2">
                    This place is waiting... for you.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          <label
            htmlFor="photo-upload"
            className="inline-block cursor-pointer rounded-full bg-stone-800 px-8 py-3 text-stone-50 transition-all duration-300 hover:scale-105 hover:bg-stone-700 active:scale-95"
          >
            📷 Choose Photograph
          </label>
        </div>

        <section className="mx-auto w-full max-w-md space-y-2 text-left">
          <label
            htmlFor="reflection"
            className="block text-sm font-medium text-stone-700"
          >
            Reflection Pond
          </label>

          <textarea
            id="reflection"
            rows={5}
            value={reflection}
            onChange={(event) =>
              setReflection(event.target.value)
            }
            placeholder="What made you stop here?"
            className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 shadow-sm focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </section>

        <section className="mx-auto w-full max-w-md space-y-2 text-left">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-stone-700"
          >
            Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your Legend a name..."
            className="w-full rounded-xl border border-stone-300 px-4 py-3 shadow-sm focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={plantLegend}
            disabled={
              saveStatus === "saving" ||
              saveStatus === "success"
            }
            className="rounded-full bg-emerald-700 px-8 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-emerald-600 active:scale-95 disabled:cursor-wait disabled:opacity-60"
          >
            {plantButtonText}
          </button>

          {message && (
            <p
              role="status"
              className={`text-sm ${
                saveStatus === "error"
                  ? "text-red-700"
                  : "text-stone-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}