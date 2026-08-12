"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setMessage("Enter your email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace("/account");
    router.refresh();
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
            Welcome Back
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink">
            Your Studio is here.
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-nebari-muted">
            Sign in to return to your Studio,
            hang new work and keep things growing.
          </p>

        </header>

        {/* LOGIN CARD */}

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
                className={inputClass}
              />

            </div>

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-nebari-ink"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleLogin();
                  }
                }}
                className={inputClass}
              />

            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-full bg-nebari-green px-8 py-3.5 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {loading
                ? "Opening Nebari..."
                : "Enter Nebari"}
            </button>

            {message && (
              <p
                role="alert"
                className="rounded-xl bg-nebari-paper/40 p-4 text-center text-sm leading-6 text-nebari-muted"
              >
                {message}
              </p>
            )}

          </div>

          {/* RETURN ACCESS */}

          <div className="border-t border-nebari-border bg-nebari-paper/30 px-8 py-6 text-center">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
              Trouble getting in?
            </p>

            <Link
              href="/forgot-password"
              className="mt-2 inline-block text-sm text-nebari-green transition-colors hover:text-nebari-maple"
            >
              Forgotten your password?
            </Link>

          </div>

        </section>

        <div className="mt-8 text-center">

          <Link
            href="/"
            className="text-sm text-nebari-muted transition-colors hover:text-nebari-green"
          >
            ← Return to Studio Nebari
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