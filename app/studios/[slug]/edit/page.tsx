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

import { supabase } from "../../../../lib/supabase";

import StudioPlantMark from "../../../components/StudioPlantMark";

import {
  normaliseStudioAccent,
  studioAccentOptions,
  type StudioAccent,
} from "../../../../lib/studio-accents";

type Studio = {
  slug: string;
  name: string;
  owner: string;
  description: string | null;
  colour: string | null;
};

export default function EditStudioPage() {
  const params =
    useParams<{ slug: string }>();

  const router = useRouter();

  const [studio, setStudio] =
    useState<Studio | null>(null);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [
    studioAccent,
    setStudioAccent,
  ] = useState<StudioAccent>(
    "japanese-maple",
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [authorised, setAuthorised] =
    useState(false);

  useEffect(() => {
    async function loadStudio() {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      /*
       * Confirm that this person owns
       * this particular Studio.
       */

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

      /*
       * Load the Studio.
       */

      const {
        data,
        error,
      } = await supabase
        .from("studios")
        .select(
          "slug, name, owner, description, colour",
        )
        .eq("slug", params.slug)
        .maybeSingle();

      if (error || !data) {
        console.error(
          "Could not load Studio:",
          error,
        );

        setMessage(
          "Your Studio could not be loaded.",
        );

        setLoading(false);
        return;
      }

      setStudio(data);

      setName(
        data.name,
      );

      setDescription(
        data.description ?? "",
      );

      setStudioAccent(
        normaliseStudioAccent(
          data.colour,
        ),
      );

      setLoading(false);
    }

    loadStudio();
  }, [params.slug, router]);

  async function handleSave() {
    if (!studio || !authorised) {
      return;
    }

    const cleanName =
      name.trim();

    const cleanDescription =
      description.trim();

    if (!cleanName) {
      setMessage(
        "Your Studio needs a name.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    /*
     * Re-check ownership immediately
     * before saving.
     */

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("studio_members")
      .select("role")
      .eq("user_id", user.id)
      .eq(
        "studio_slug",
        studio.slug,
      )
      .eq("role", "owner")
      .maybeSingle();

    if (
      membershipError ||
      !membership
    ) {
      setMessage(
        "You do not have permission to edit this Studio.",
      );

      setSaving(false);
      return;
    }

    const { error } =
      await supabase
        .from("studios")
        .update({
          name: cleanName,

          description:
            cleanDescription || null,

          colour:
            studioAccent,
        })
        .eq(
          "slug",
          studio.slug,
        );

    if (error) {
      console.error(
        "Could not update Studio:",
        error,
      );

      setMessage(
        "Your Studio could not be saved.",
      );

      setSaving(false);
      return;
    }

    router.replace(
      `/studios/${studio.slug}`,
    );

    router.refresh();
  }

  if (loading) {
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

        <div className="mx-auto max-w-md text-center">

          <h1 className="nebari-serif text-3xl text-nebari-ink">
            We couldn&apos;t open this Studio.
          </h1>

          <Link
            href={`/studios/${params.slug}`}
            className="mt-6 inline-block text-sm text-nebari-green"
          >
            ← Return to Studio
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
            Your Studio
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink">
            Make it yours.
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-nebari-muted">
            Your Studio can change as your work does.
            Give it a name, a few words and a small
            visual identity of its own.
          </p>

        </header>

        {/* FORM */}

        <section className="mt-10 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">

          {/* THE STUDIO */}

          <div className="border-b border-nebari-border p-8">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
              The Studio
            </p>

            <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
              Give the space an identity.
            </h2>

            <div className="mt-6">

              <label
                htmlFor="studio-name"
                className="block text-sm font-medium text-nebari-ink"
              >
                Studio name
              </label>

              <input
                id="studio-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                className={inputClass}
              />

            </div>

            <div className="mt-5">

              <p className="text-sm font-medium text-nebari-ink">
                Studio address
              </p>

              <div className="mt-2 rounded-xl border border-nebari-border bg-nebari-paper/40 px-4 py-3">

                <p className="text-sm text-nebari-muted">
                  /studios/{studio.slug}
                </p>

              </div>

              <p className="mt-2 text-xs leading-5 text-nebari-muted">
                Your Studio address stays the same,
                even if its name changes.
              </p>

            </div>

          </div>

          {/* ABOUT */}

          <div className="border-b border-nebari-border p-8">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
              About
            </p>

            <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
              What&apos;s growing here?
            </h2>

            <p className="mt-3 text-sm leading-6 text-nebari-muted">
              A few words about your work, an idea
              you&apos;re exploring, or simply what has
              your attention at the moment.
            </p>

            <textarea
              id="description"
              rows={6}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="You can leave this blank and come back later."
              className={`${inputClass} resize-y leading-7`}
            />

            <p className="mt-2 text-xs italic leading-5 text-nebari-muted">
              It doesn&apos;t need to define your Studio forever.
            </p>

          </div>

          {/* STUDIO ACCENT */}

          <div className="p-8">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
              Studio Accent
            </p>

            <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
              Choose something that feels like yours.
            </h2>

            <p className="mt-3 text-sm leading-6 text-nebari-muted">
              Each plant gives your Studio a small
              botanical signature and a quiet accent colour.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              {studioAccentOptions.map(
                (accent) => {
                  const selected =
                    studioAccent ===
                    accent.value;

                  return (
                    <button
                      key={accent.value}
                      type="button"
                      onClick={() =>
                        setStudioAccent(
                          accent.value,
                        )
                      }
                      className={`group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? "border-nebari-sage bg-nebari-paper/50 shadow-sm"
                          : "border-nebari-border bg-background/40 hover:border-nebari-sage hover:bg-nebari-paper/30"
                      }`}
                    >

                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-nebari-surface"
                        style={{
                          borderColor:
                            `${accent.colour}55`,
                        }}
                      >

                        <StudioPlantMark
                          plant={
                            accent.mark
                          }
                          colour={
                            accent.colour
                          }
                          size="large"
                        />

                      </div>

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <p className="nebari-serif text-lg text-nebari-ink">
                            {accent.name}
                          </p>

                          {selected && (
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  accent.colour,
                              }}
                            />
                          )}

                        </div>

                        <p className="mt-1 text-xs text-nebari-muted">
                          {
                            accent.description
                          }
                        </p>

                      </div>

                    </button>
                  );
                },
              )}

            </div>

            <div className="mt-7 rounded-2xl border border-nebari-border bg-nebari-paper/30 p-5">

              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nebari-muted">
                Your selection
              </p>

              {studioAccentOptions
                .filter(
                  (accent) =>
                    accent.value ===
                    studioAccent,
                )
                .map(
                  (accent) => (
                    <div
                      key={
                        accent.value
                      }
                      className="mt-4 flex items-center gap-4"
                    >

                      <StudioPlantMark
                        plant={
                          accent.mark
                        }
                        colour={
                          accent.colour
                        }
                        size="large"
                      />

                      <div>

                        <p className="nebari-serif text-xl text-nebari-ink">
                          {
                            accent.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-nebari-muted">
                          {
                            accent.description
                          }
                        </p>

                      </div>

                    </div>
                  ),
                )}

            </div>

            <p className="mt-4 text-xs italic leading-5 text-nebari-muted">
              You can change this whenever your Studio
              feels ready for something different.
            </p>

          </div>

          {/* SAVE */}

          <div className="border-t border-nebari-border bg-nebari-paper/30 px-8 py-6">

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <Link
                href={`/studios/${studio.slug}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-nebari-border px-7 py-3 text-sm text-nebari-muted transition-all hover:bg-nebari-surface hover:text-nebari-ink"
              >
                Cancel
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-nebari-green px-8 py-3 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Studio"}
              </button>

            </div>

            {message && (
              <p
                role="alert"
                className="mt-4 text-center text-sm text-nebari-maple"
              >
                {message}
              </p>
            )}

          </div>

        </section>

        <footer className="mt-8 text-center">

          <p className="text-xs italic text-nebari-muted">
            Your work can change. Your Studio can too.
          </p>

        </footer>

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