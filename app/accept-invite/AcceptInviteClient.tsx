"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

import { supabase } from "../../lib/supabase";

export default function AcceptInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenHash =
    searchParams.get("token_hash");

  const inviteType =
    searchParams.get("type");

  const [accepting, setAccepting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleAcceptInvite() {
    if (
      !tokenHash ||
      inviteType !== "invite"
    ) {
      setErrorMessage(
        "This invitation link is incomplete.",
      );
      return;
    }

    setAccepting(true);
    setErrorMessage("");

    const { error } =
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "invite",
      });

    if (error) {
      console.error(
        "Could not accept invitation:",
        error,
      );

      setErrorMessage(
        "This invitation could not be accepted. It may have expired or already been used.",
      );

      setAccepting(false);
      return;
    }

    router.replace("/update-password");
    router.refresh();
  }

  const invitationIsComplete =
    Boolean(tokenHash) &&
    inviteType === "invite";

  return (
    <div className="mx-auto max-w-lg space-y-10">

      <header className="space-y-4 text-center">
        <p className="text-4xl">🌿</p>

        <h1 className="text-4xl font-light tracking-wide text-stone-800">
          Your Studio is waiting.
        </h1>

        <p className="mx-auto max-w-md leading-7 text-stone-600">
          You&apos;ve been invited to join
          Nebari Gallery.
        </p>
      </header>

      <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">

        <p className="leading-7 text-stone-600">
          We&apos;ve made a Studio for you —
          a place to keep and share the things
          you make.
        </p>

        <p className="text-sm leading-6 text-stone-500">
          There&apos;s no need for it to be
          perfect. It just needs to be yours.
        </p>

        {invitationIsComplete ? (
          <button
            type="button"
            onClick={handleAcceptInvite}
            disabled={accepting}
            className="flex w-full items-center justify-center rounded-full bg-stone-800 px-8 py-3 text-sm text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {accepting
              ? "Opening your Studio..."
              : "Set up my Studio →"}
          </button>
        ) : (
          <p className="rounded-xl bg-stone-100 p-4 text-sm leading-6 text-stone-600">
            This invitation link is incomplete.
            Please use the link from your Nebari
            invitation email.
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            {errorMessage}
          </p>
        )}

      </section>

      <footer className="text-center">
        <Link
          href="/"
          className="text-sm text-stone-400 transition-colors hover:text-stone-700"
        >
          Nebari Gallery
        </Link>
      </footer>

    </div>
  );
}