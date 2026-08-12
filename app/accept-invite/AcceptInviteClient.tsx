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
    <div className="flex min-h-screen flex-col">

      {/* BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nebari-muted">
            An invitation
          </p>

        </div>
      </div>

      {/* INVITATION */}

      <div className="flex flex-1 items-center px-6 py-16">

        <div className="mx-auto w-full max-w-xl">

          <header className="text-center">

            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
              Welcome to Nebari
            </p>

            <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink sm:text-6xl">
              Your Studio is waiting.
            </h1>

            <div className="mx-auto mt-6 flex items-center justify-center gap-3">

              <span className="h-px w-12 bg-nebari-maple/40" />

              <span className="text-sm text-nebari-maple">
                ◆
              </span>

              <span className="h-px w-12 bg-nebari-maple/40" />

            </div>

            <p className="mx-auto mt-6 max-w-md text-base leading-8 text-nebari-muted">
              You&apos;ve been invited to join
              Nebari Gallery and make a little
              creative space of your own.
            </p>

          </header>

          {/* INVITATION CARD */}

          <section className="mt-10 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">

            <div className="space-y-6 p-8 text-center sm:p-10">

              <div>

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-green">
                  Your Studio
                </p>

                <h2 className="nebari-serif mt-3 text-3xl font-medium text-nebari-ink">
                  A place for the things you make.
                </h2>

              </div>

              <p className="mx-auto max-w-md text-sm leading-7 text-nebari-muted">
                Your Studio is your own corner of
                Nebari — somewhere to keep your work,
                follow ideas as they develop and share
                the pieces you choose.
              </p>

              <div className="mx-auto h-px max-w-xs bg-nebari-border" />

              <p className="mx-auto max-w-sm text-sm italic leading-7 text-nebari-muted">
                It doesn&apos;t need to be perfect.
                It just needs to be yours.
              </p>

              {invitationIsComplete ? (
                <button
                  type="button"
                  onClick={handleAcceptInvite}
                  disabled={accepting}
                  className="mt-2 flex w-full items-center justify-center rounded-full bg-nebari-green px-8 py-3.5 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {accepting
                    ? "Opening your Studio..."
                    : "Enter Nebari →"}
                </button>
              ) : (
                <div className="rounded-xl border border-nebari-border bg-nebari-paper/40 p-5">

                  <p className="text-sm leading-6 text-nebari-muted">
                    This invitation link is incomplete.
                    Please use the link from your Nebari
                    invitation email.
                  </p>

                </div>
              )}

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-xl border border-nebari-maple/20 bg-nebari-paper/40 p-4 text-sm leading-6 text-nebari-maple"
                >
                  {errorMessage}
                </p>
              )}

            </div>

            {/* WHAT HAPPENS NEXT */}

            <div className="border-t border-nebari-border bg-nebari-paper/30 px-8 py-6">

              <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
                What happens next
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">

                <div>
                  <p className="nebari-serif text-xl text-nebari-maple">
                    01
                  </p>

                  <p className="mt-1 text-xs leading-5 text-nebari-muted">
                    Choose your password
                  </p>
                </div>

                <div>
                  <p className="nebari-serif text-xl text-nebari-maple">
                    02
                  </p>

                  <p className="mt-1 text-xs leading-5 text-nebari-muted">
                    Open your Studio
                  </p>
                </div>

                <div>
                  <p className="nebari-serif text-xl text-nebari-maple">
                    03
                  </p>

                  <p className="mt-1 text-xs leading-5 text-nebari-muted">
                    Hang your first piece
                  </p>
                </div>

              </div>

            </div>

          </section>

          <footer className="mt-10 text-center">

            <Link
              href="/"
              className="text-xs text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Visit Nebari Gallery
            </Link>

          </footer>

        </div>

      </div>

      {/* TIMBER FOOTER */}

      <footer className="border-t border-[#2b211c] bg-[#3b2f2a]">

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

    </div>
  );
}
