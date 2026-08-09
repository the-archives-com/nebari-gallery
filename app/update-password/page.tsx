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

    setMessage("Your new password is ready. 🌿");

    setTimeout(() => {
      router.replace("/login");
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-md space-y-8">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🍁</p>

          <h1 className="text-4xl font-light tracking-wide">
            Choose a New Key
          </h1>

          <p className="leading-7 text-stone-600">
            Set a new password for your Studio.
          </p>
        </header>

        {!ready ? (
          <section className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <p className="text-stone-600">
              Opening your password link...
            </p>
          </section>
        ) : (
          <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700"
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
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-stone-700"
              >
                Confirm new password
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
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={saving}
              className="w-full rounded-full bg-stone-800 px-8 py-3 text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Set New Password"}
            </button>

            {message && (
              <p className="text-center text-sm text-stone-600">
                {message}
              </p>
            )}
          </section>
        )}

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