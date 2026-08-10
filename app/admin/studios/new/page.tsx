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
  setErrorMessage("Please give the Studio a name.");
  return;
}

if (!owner.trim()) {
  setErrorMessage("Please add the owner’s name.");
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
      setOwnerEmail(event.target.value)
    }
    placeholder="artist@example.com"
    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
  />

  <p className="mt-2 text-xs text-stone-400">
    We’ll send their Nebari invitation here.
  </p>
</div>


    if (!finalSlug) {
      setErrorMessage(
        "Please choose a Studio address.",
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("studios")
      .insert({
        slug: finalSlug,
        name: name.trim(),
        owner: owner.trim(),
        description:
          description.trim() || null,
        icon: icon.trim() || "🌿",
        colour: colour.trim() || null,
      });

    if (error) {
      console.error(
        "Could not create Studio:",
        error,
      );

      if (
        error.message
          .toLowerCase()
          .includes("duplicate")
      ) {
        setErrorMessage(
          "That Studio address is already being used.",
        );
      } else {
        setErrorMessage(
          `Could not create the Studio: ${error.message}`,
        );
      }

      setSaving(false);
      return;
    }
const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.access_token) {
  setErrorMessage(
    "Your Studio was created, but your login could not be verified to send the invitation.",
  );

  setSaving(false);
  return;
}

const inviteResponse = await fetch(
  "/api/admin/invite-studio-owner",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      email: ownerEmail.trim(),
      ownerName: owner.trim(),
    }),
  },
);

const inviteResult =
  await inviteResponse.json();

if (!inviteResponse.ok) {
  setErrorMessage(
    `The Studio was created, but the invitation could not be sent: ${inviteResult.error ?? "Unknown error"}`,
  );

  setSaving(false);
  return;
}


    router.push("/admin/studios");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-xl space-y-10">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🌿</p>

          <h1 className="text-4xl font-light tracking-wide text-stone-800">
            Create a Studio
          </h1>

          <p className="mx-auto max-w-md leading-7 text-stone-600">
            Make a new little corner of Nebari for
            someone to call their own.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
        

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
                setSlug(cleanSlug(event.target.value))
              }
              placeholder="heather"
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />

            <p className="mt-2 text-xs text-stone-400">
              This becomes:
              {" "}
              /studios/{slug || "studio-name"}
            </p>
          </div>

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
                setDescription(event.target.value)
              }
              placeholder="A quiet place for colour, ideas and things worth making."
              className="mt-2 w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

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
                setColour(event.target.value)
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

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center rounded-full bg-stone-800 px-8 py-3 text-sm text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? ""Creating Studio & Sending Invitation..."
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
      router.push("/admin/studios");
router.refresh();

    </main>
  );
}