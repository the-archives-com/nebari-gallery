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
  const [description, setDescription] = useState("");
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
     * The server API now handles the complete
     * operation:
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

            description:
              description.trim() || null,

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

      /*
       * Everything worked.
       */
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

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-xl space-y-10">

        <header className="space-y-4 text-center">
          <p className="text-4xl">
            🌿
          </p>

          <h1 className="text-4xl font-light tracking-wide text-stone-800">
            Create a Studio
          </h1>

          <p className="mx-auto max-w-md leading-7 text-stone-600">
            Make a new little corner of Nebari
            for someone to call their own.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
        >

          {/* OWNER NAME */}

          <div>
            <label
              htmlFor="owner"
              className="block text-sm font-medium text-stone-700"
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
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          {/* OWNER EMAIL */}

          <div>
            <label
              htmlFor="owner-email"
              className="block text-sm font-medium text-stone-700"
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
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />

            <p className="mt-2 text-xs text-stone-400">
              We’ll send their Nebari
              invitation here.
            </p>
          </div>

          {/* STUDIO NAME */}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700"
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
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          {/* STUDIO SLUG */}

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-stone-700"
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
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />

            <p className="mt-2 text-xs text-stone-400">
              This becomes:{" "}
              /studios/
              {slug || "studio-name"}
            </p>
          </div>

          {/* SYMBOL */}

          <div>
            <label
              htmlFor="icon"
              className="block text-sm font-medium text-stone-700"
            >
              Symbol
            </label>

            <input
              id="icon"
              value={icon}
              onChange={(event) =>
                setIcon(event.target.value)
              }
              placeholder="🎨"
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />

            <p className="mt-2 text-xs text-stone-400">
              An emoji works nicely here.
            </p>
          </div>

          {/* DESCRIPTION */}

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-stone-700"
            >
              Short description
            </label>

            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="A quiet place for colour, ideas and things worth making."
              className="mt-2 w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          {/* COLOUR */}

          <div>
            <label
              htmlFor="colour"
              className="block text-sm font-medium text-stone-700"
            >
              Accent colour
            </label>

            <select
              id="colour"
              value={colour}
              onChange={(event) =>
                setColour(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800"
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

          {/* ERROR */}

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center rounded-full bg-stone-800 px-8 py-3 text-sm text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Creating Studio & Sending Invitation..."
              : "Create Studio & Send Invitation"}
          </button>

        </form>

        <footer className="text-center">
          <Link
            href="/admin/studios"
            className="text-sm text-stone-400 transition-colors hover:text-stone-700"
          >
            ← Manage Studios
          </Link>
        </footer>

      </div>
    </main>
  );
}