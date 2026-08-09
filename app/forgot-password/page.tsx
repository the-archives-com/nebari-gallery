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
          redirectTo: `${window.location.origin}/update-password`,
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

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-md space-y-8">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🌿</p>

          <h1 className="text-4xl font-light tracking-wide">
            Return to Your Studio
          </h1>

          <p className="leading-7 text-stone-600">
            Enter the email attached to your Studio and
            we&apos;ll send you a way back in.
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

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-full bg-stone-800 px-8 py-3 text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-60"
          >
            {loading
              ? "Sending..."
              : "Send Password Link"}
          </button>

          {message && (
            <p className="text-center text-sm leading-6 text-stone-600">
              {message}
            </p>
          )}
        </section>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            ← Back to login
          </Link>
        </div>

      </div>
    </main>
  );
}