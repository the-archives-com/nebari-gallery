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

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace("/studios");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-md space-y-8">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🍁</p>

          <h1 className="text-4xl font-light tracking-wide">
            Welcome Back
          </h1>

          <p className="text-stone-600">
            Open your Edabari Studio.
          </p>
        </header>

        <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700"
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
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700"
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
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-full bg-stone-800 px-8 py-3 text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-60"
          >
            {loading
              ? "Opening Studio..."
              : "Open My Studio"}
          </button>

          {message && (
            <p className="text-center text-sm text-stone-600">
              {message}
            </p>
          )}

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-stone-400 transition-colors hover:text-stone-700"
            >
              Forgotten your password?
            </Link>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            ← Edabari Studio
          </Link>
        </div>

      </div>
    </main>
  );
}