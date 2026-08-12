"use client";

import Link from "next/link";
import { useState } from "react";

import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleReset() {
    if (!email.trim()) {
      setMessage("Enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo:
            `${window.location.origin}/update-password`,
        },
      );

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Check your email. We’ve sent you a link to choose a new password.",
    );

    setLoading(false);
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

          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nebari-muted">
            Studio Access
          </p>

        </div>
      </div>

      <div className="mx-auto max-w-md px-6 py-16">

        {/* HEADER */}

        <header className="text-center">

          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Find Your Way Back
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink">
            Return to your Studio.
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-nebari-muted">
            Enter the email attached to your Studio
            and we&apos;ll send you a link to choose
            a new password.
          </p>

        </header>

        {/* RESET CARD */}

        <section className="mt-10 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">

          <div className="space-y-5 p-8">

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-nebari-ink"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleReset();
                  }
                }}
                className={inputClass}
              />

            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="w-full rounded-full bg-nebari-green px-8 py-3.5 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {loading
                ? "Sending your link..."
                : "Send Password Link"}
            </button>

            {message && (
              <p
                role="status"
                className="rounded-xl bg-nebari-paper/40 p-4 text-center text-sm leading-6 text-nebari-muted"
              >
                {message}
              </p>
            )}

          </div>

          {/* WHAT HAPPENS NEXT */}

          <div className="border-t border-nebari-border bg-nebari-paper/30 px-8 py-6 text-center">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
              What happens next
            </p>

            <p className="nebari-serif mt-2 text-xl text-nebari-ink">
              Check your inbox.
            </p>

            <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-nebari-muted">
              Follow the link in the email and choose
              a new key for your Studio.
            </p>

          </div>

        </section>

        <div className="mt-8 text-center">

          <Link
            href="/login"
            className="text-sm text-nebari-muted transition-colors hover:text-nebari-green"
          >
            ← Back to login
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