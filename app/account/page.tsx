"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

type Membership = {
  studio_slug: string;
  role: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [membership, setMembership] =
    useState<Membership | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("studio_members")
        .select("studio_slug, role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(
          "Could not load Studio membership:",
          error,
        );

        setMessage(
          "Your login is active, but no Studio is linked to this account yet.",
        );

        setLoading(false);
        return;
      }

      setMembership(data);
      setLoading(false);
    }

    loadAccount();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <p className="text-center italic text-stone-500">
          🌿 Opening your Studio account...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-lg space-y-10">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🍁</p>

          <h1 className="text-4xl font-light tracking-wide">
            My Account
          </h1>

          <p className="leading-7 text-stone-600">
            Your Edabari Studio account.
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
              Signed in as
            </p>

            <p className="mt-2 text-stone-700">
              {email}
            </p>
          </div>

          {membership && (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                Studio
              </p>

              <p className="mt-2 capitalize text-stone-700">
                {membership.studio_slug}
              </p>
            </div>
          )}

          {message && (
            <p className="rounded-xl bg-stone-100 p-4 text-sm leading-6 text-stone-600">
              {message}
            </p>
          )}

          {membership && (
            <Link
              href={`/studios/${membership.studio_slug}`}
              className="flex w-full items-center justify-center rounded-full bg-stone-800 px-8 py-3 text-sm text-stone-50 transition-all hover:bg-stone-700 active:scale-[0.98]"
            >
              Open My Studio
            </Link>
          )}

          <Link
            href="/update-password"
            className="flex w-full items-center justify-center rounded-full border border-stone-300 px-8 py-3 text-sm text-stone-700 transition-all hover:bg-stone-100"
          >
            🔑 Change Password
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-full border border-stone-300 px-8 py-3 text-sm text-stone-500 transition-all hover:border-stone-400 hover:bg-stone-50 hover:text-stone-800"
          >
            Sign Out
          </button>
        </section>

        <div className="flex justify-center gap-4 text-xs text-stone-400">
          <Link
            href="/privacy"
            className="transition-colors hover:text-stone-700"
          >
            Privacy
          </Link>

          <span aria-hidden="true">·</span>

          <Link
            href="/terms"
            className="transition-colors hover:text-stone-700"
          >
            Terms
          </Link>

          <span aria-hidden="true">·</span>

          <Link
            href="/"
            className="transition-colors hover:text-stone-700"
          >
            Edabari Studio
          </Link>
        </div>

      </div>
    </main>
  );
}