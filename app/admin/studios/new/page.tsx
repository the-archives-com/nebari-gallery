"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../../lib/supabase";

export default function NewStudioPage() {
  const router = useRouter();

  const [ownerEmail, setOwnerEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");


  const [icon, setIcon] = useState("🌿");
  const [colour, setColour] = useState("stone");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function cleanSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    const finalSlug = cleanSlug(slug);

    if (!name.trim()) {
      setErrorMessage(
        "Please give the Studio a name.",
      );
      return;
    }

    if (!owner.trim()) {
      setErrorMessage(
        "Please add the owner’s name.",
      );
      return;
    }

    if (!ownerEmail.trim()) {
      setErrorMessage(
        "Please add the owner’s email address.",
      );
      return;
    }

    if (!finalSlug) {
      setErrorMessage(
        "Please choose a Studio address.",
      );
      return;
    }

    setSaving(true);

    /*
     * Get the signed-in Nebari administrator's
     * access token.
     */
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (
      sessionError ||
      !session?.access_token
    ) {
      console.error(
        "Could not verify administrator session:",
        sessionError,
      );

      setErrorMessage(
        "Your login could not be verified. Please sign in again.",
      );

      setSaving(false);
      return;
    }

    /*
     * The server API handles:
     *
     * 1. Create Studio
     * 2. Invite owner
     * 3. Create Studio membership
     */
    try {
      const response = await fetch(
        "/api/admin/invite-studio-owner",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            email: ownerEmail
              .trim()
              .toLowerCase(),

            ownerName:
              owner.trim(),

            studioSlug:
              finalSlug,

            studioName:
              name.trim(),

            description: null,

            icon:
              icon.trim() || "🌿",

            colour:
              colour.trim() || null,
          }),
        },
      );

      let result: {
        success?: boolean;
        error?: string;
        studioSlug?: string;
      } = {};

      try {
        result = await response.json();
      } catch {
        setErrorMessage(
          "Nebari received an unexpected response while creating the Studio.",
        );

        setSaving(false);
        return;
      }

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "The Studio could not be created.",
        );

        setSaving(false);
        return;
      }

      router.push("/admin/studios");
      router.refresh();
    } catch (error) {
      console.error(
        "Could not create Studio:",
        error,
      );

      setErrorMessage(
        "Nebari could not create the Studio. Please try again.",
      );

      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-nebari-border bg-background px-4 py-3 text-nebari-ink outline-none transition-all placeholder:text-nebari-muted/60 focus:border-nebari-sage focus:ring-2 focus:ring-nebari-sage/20";

  const labelClass =
    "block text-sm font-medium text-nebari-ink";

  const helperClass =
    "mt-2 text-xs leading-5 text-nebari-muted";

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ADMIN BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

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
              Studios
            </Link>

            <Link
              href="/admin/gallery"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Gallery Submissions
            </Link>

          </nav>

        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-10 px-6 py-16">

        {/* HEADER */}

        <header className="text-center">

          <p className="text-3xl">
            🍁
          </p>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Nebari Administration
          </p>

          <h1 className="nebari-serif mt-4 text-5xl font-medium tracking-tight text-nebari-ink">
            Create a Studio
          </h1>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-nebari-muted">
            Open a new creative space and invite
            its owner into Nebari.
          </p>

        </header>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm"
        >

          {/* OWNER */}

          <section className="space-y-6 border-b border-nebari-border p-7 sm:p-8">

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
                The Artist
              </p>

              <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
                Who is this Studio for?
              </h2>
            </div>

            <div>
              <label
                htmlFor="owner"
                className={labelClass}
              >
                Owner name
              </label>

              <input
                id="owner"
                value={owner}
                onChange={(event) =>
                  setOwner(event.target.value)
                }
                placeholder="Heather"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="owner-email"
                className={labelClass}
              >
                Owner email
              </label>

              <input
                id="owner-email"
                type="email"
                value={ownerEmail}
                onChange={(event) =>
                  setOwnerEmail(
                    event.target.value,
                  )
                }
                placeholder="artist@example.com"
                className={inputClass}
              />

              <p className={helperClass}>
                Their invitation to join Nebari
                will be sent here.
              </p>
            </div>

          </section>

          {/* STUDIO */}

          <section className="space-y-6 border-b border-nebari-border p-7 sm:p-8">

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
                The Studio
              </p>

              <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
                Give the space an identity.
              </h2>
            </div>

            <div>
              <label
                htmlFor="name"
                className={labelClass}
              >
                Studio name
              </label>

              <input
                id="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Heather's Studio"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className={labelClass}
              >
                Studio address
              </label>

              <input
                id="slug"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    cleanSlug(
                      event.target.value,
                    ),
                  )
                }
                placeholder="heather"
                className={inputClass}
              />

              <p className={helperClass}>
                nebari.com.au/studios/
                <span className="text-nebari-green">
                  {slug || "studio-name"}
                </span>
              </p>
            </div>
            

          </section>

          {/* DETAILS */}

          <section className="space-y-6 p-7 sm:p-8">

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
                Details
              </p>

              <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
                A couple of finishing touches.
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="icon"
                  className={labelClass}
                >
                  Studio symbol
                </label>

                <input
                  id="icon"
                  value={icon}
                  onChange={(event) =>
                    setIcon(
                      event.target.value,
                    )
                  }
                  placeholder="○"
                  className={inputClass}
                />

                <p className={helperClass}>
                  Optional. Keep it simple.
                </p>
              </div>

              <div>
                <label
                  htmlFor="colour"
                  className={labelClass}
                >
                  Accent
                </label>

                <select
                  id="colour"
                  value={colour}
                  onChange={(event) =>
                    setColour(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="stone">
                    Stone
                  </option>

                  <option value="green">
                    Green
                  </option>

                  <option value="amber">
                    Amber
                  </option>

                  <option value="rose">
                    Rose
                  </option>

                  <option value="blue">
                    Blue
                  </option>

                  <option value="violet">
                    Violet
                  </option>
                </select>
              </div>

            </div>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl border border-nebari-maple/20 bg-nebari-paper/40 p-4 text-sm leading-6 text-nebari-maple"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center rounded-full bg-nebari-green px-8 py-3.5 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating Studio & Sending Invitation..."
                : "Create Studio & Send Invitation"}
            </button>

            <p className="text-center text-xs leading-5 text-nebari-muted">
              Nebari will create the Studio,
              send the invitation and connect
              the owner automatically.
            </p>

          </section>

        </form>

        <footer className="text-center">
          <Link
            href="/admin/studios"
            className="text-sm text-nebari-muted transition-colors hover:text-nebari-green"
          >
            ← Manage Studios
          </Link>
        </footer>

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
