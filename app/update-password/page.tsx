"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          setReady(true);
        }
      },
    );

    supabase.auth.getSession().then(
      ({ data: { session } }) => {
        if (session) {
          setReady(true);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword() {
    if (password.length < 8) {
      setMessage(
        "Choose a password with at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords don't match.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

      setMessage(
        "Your password is ready. Taking you to sign in...",
      );

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
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

        <header className="text-center">

          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Step Two
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink">
            Choose your key.
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-nebari-muted">
            Set the password you&apos;ll use to return
            to your Studio.
          </p>

        </header>

        {!ready ? (
          <section className="mt-10 rounded-2xl border border-nebari-border bg-nebari-surface p-8 text-center shadow-sm">

            <p className="text-sm text-nebari-muted">
              Opening your password link...
            </p>

          </section>
        ) : (
          <section className="mt-10 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">

            <div className="space-y-5 p-8">

              <div>

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-nebari-ink"
                >
                  New password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  className={inputClass}
                />

                <p className="mt-2 text-xs leading-5 text-nebari-muted">
                  Use at least 8 characters.
                </p>

              </div>

              <div>

                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-nebari-ink"
                >
                  Confirm password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />

              </div>

              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={saving}
                className="w-full rounded-full bg-nebari-green px-8 py-3.5 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving your key..."
                  : "Set Password & Continue"}
              </button>

              {message && (
                <p className="rounded-xl bg-nebari-paper/40 p-4 text-center text-sm leading-6 text-nebari-muted">
                  {message}
                </p>
              )}

            </div>

            {/* NEXT STEP */}

            <div className="border-t border-nebari-border bg-nebari-paper/30 px-8 py-6 text-center">

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
                Next
              </p>

              <p className="nebari-serif mt-2 text-xl text-nebari-ink">
                Open your Studio.
              </p>

            </div>

          </section>
        )}

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